from rest_framework import serializers
from .models import Trips, TripStops, ItineraryItems, Activities, Expenses, Cities

class TripsSerializer(serializers.ModelSerializer):
    isPublic = serializers.BooleanField(source='is_public', required=False)

    class Meta:
        model = Trips
        fields = ['id', 'user', 'name', 'description', 'start_date', 'end_date', 'cover_image', 'budget', 'isPublic', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date is None and self.instance:
            start_date = self.instance.start_date
        if end_date is None and self.instance:
            end_date = self.instance.end_date

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError("End date must be greater than or equal to start date.")
        return data

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        
        # Build all itinerary items for this trip
        itinerary_qs = ItineraryItems.objects.filter(trip=instance).order_by('sort_order')
        itinerary_list = []
        for item in itinerary_qs:
            itinerary_list.append({
                "id": str(item.id),
                "trip_id": str(instance.id),
                "trip_stop_id": str(item.trip_stop.id) if item.trip_stop else "",
                "activity_id": str(item.activity.id) if item.activity else "",
                "date": item.date.isoformat() if item.date else None,
                "start_time": item.start_time.strftime("%H:%M") if item.start_time else "10:00",
                "end_time": item.end_time.strftime("%H:%M") if item.end_time else "12:00",
                "sort_order": item.sort_order,
                "activity_detail": {
                    "id": str(item.activity.id) if item.activity else "",
                    "name": item.activity.name if item.activity else "",
                    "description": item.activity.description if item.activity else "",
                    "activity_type": item.activity.activity_type if item.activity else "Sightseeing",
                    "duration_minutes": item.activity.duration_minutes if item.activity else 60,
                    "estimated_cost": float(item.activity.estimated_cost) if item.activity else 0
                } if item.activity else None
            })
        ret['itinerary_items'] = itinerary_list

        stops_qs = TripStops.objects.filter(trip=instance).order_by('stop_order')
        stops_list = []
        for stop in stops_qs:
            stop_itinerary = [item for item in itinerary_list if item["trip_stop_id"] == str(stop.id)]
            activities_names = [item["activity_detail"]["name"] for item in stop_itinerary if item["activity_detail"]]
            stops_list.append({
                "id": str(stop.id),
                "city_id": str(stop.city.id) if stop.city else "",
                "city": {
                    "id": str(stop.city.id) if stop.city else "",
                    "name": stop.city.name if stop.city else "",
                    "country": stop.city.country if stop.city else ""
                } if stop.city else None,
                "start_date": stop.start_date.isoformat() if stop.start_date else None,
                "end_date": stop.end_date.isoformat() if stop.end_date else None,
                "stop_order": stop.stop_order,
                "activities": activities_names,
                "itinerary_items": stop_itinerary
            })
        ret['stops'] = stops_list

        expenses_qs = Expenses.objects.filter(trip=instance)
        expenses_list = []
        for exp in expenses_qs:
            expenses_list.append({
                "id": str(exp.id),
                "title": exp.description or exp.category,
                "amount": float(exp.amount),
                "category": exp.category,
                "expense_date": exp.expense_date.isoformat() if exp.expense_date else None,
                "trip_stop_id": str(exp.trip_stop.id) if exp.trip_stop else None
            })
        ret['expenses'] = expenses_list
        return ret

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        request = self.context.get('request')
        
        if request and request.data:
            temp_to_db_stop_ids = {}
            
            if 'stops' in request.data:
                new_stops_data = request.data['stops']
                keep_stop_ids = []
                for order, stop_data in enumerate(new_stops_data, start=1):
                    stop_id_val = stop_data.get('id')
                    city_id_val = stop_data.get('city_id')
                    city_data = stop_data.get('city')
                    
                    city_obj = None
                    if city_id_val and not str(city_id_val).startswith('17'):
                        try:
                            city_obj = Cities.objects.get(id=int(city_id_val))
                        except (ValueError, Cities.DoesNotExist):
                            pass
                            
                    if not city_obj:
                        city_name = ""
                        country_name = "Unknown"
                        
                        if isinstance(city_data, dict):
                            city_name = city_data.get('name', '')
                            country_name = city_data.get('country', 'Unknown')
                        elif isinstance(city_data, str):
                            city_name = city_data
                            country_name = stop_data.get('country', 'Unknown')
                            
                        if not city_name:
                            city_name = "Unknown"

                        city_obj, _ = Cities.objects.get_or_create(
                            name=city_name,
                            defaults={'country': country_name}
                        )

                    stop_obj = None
                    if stop_id_val and not str(stop_id_val).startswith('17'):
                        try:
                            stop_obj = TripStops.objects.get(id=int(stop_id_val), trip=instance)
                        except (ValueError, TripStops.DoesNotExist):
                            pass

                    s_date = stop_data.get('start_date') or instance.start_date
                    e_date = stop_data.get('end_date') or instance.end_date

                    if stop_obj:
                        stop_obj.city = city_obj
                        stop_obj.start_date = s_date
                        stop_obj.end_date = e_date
                        stop_obj.stop_order = order
                        stop_obj.save()
                    else:
                        stop_obj = TripStops.objects.create(
                            trip=instance,
                            city=city_obj,
                            start_date=s_date,
                            end_date=e_date,
                            stop_order=order
                        )
                    keep_stop_ids.append(stop_obj.id)
                    if stop_id_val:
                        temp_to_db_stop_ids[str(stop_id_val)] = stop_obj

                TripStops.objects.filter(trip=instance).exclude(id__in=keep_stop_ids).delete()

            # Update Itinerary Items
            if 'itinerary_items' in request.data:
                new_items_data = request.data['itinerary_items']
                keep_item_ids = []
                for item_data in new_items_data:
                    item_id_val = item_data.get('id')
                    stop_id_val = item_data.get('trip_stop_id')
                    act_id_val = item_data.get('activity_id')
                    date_val = item_data.get('date') or instance.start_date
                    start_time_val = item_data.get('start_time') or "10:00"
                    end_time_val = item_data.get('end_time') or "12:00"
                    order_val = item_data.get('sort_order', 1)
                    
                    stop_obj = temp_to_db_stop_ids.get(str(stop_id_val))
                    if not stop_obj and stop_id_val and not str(stop_id_val).startswith('17'):
                        try:
                            stop_obj = TripStops.objects.get(id=int(stop_id_val), trip=instance)
                        except (ValueError, TripStops.DoesNotExist):
                            pass
                            
                    if not stop_obj:
                        continue
                        
                    act_detail = item_data.get('activity_detail') or {}
                    act_name = act_detail.get('name') or item_data.get('activity_name') or "Sightseeing"
                    act_type = act_detail.get('activity_type') or "Sightseeing"
                    act_cost = act_detail.get('estimated_cost') or 0
                    
                    act_obj = None
                    if act_id_val and not str(act_id_val).startswith('preset') and not str(act_id_val).startswith('custom'):
                        try:
                            act_obj = Activities.objects.get(id=int(act_id_val))
                        except (ValueError, Activities.DoesNotExist):
                            pass
                            
                    if not act_obj:
                        act_obj, _ = Activities.objects.get_or_create(
                            city=stop_obj.city,
                            name=act_name,
                            defaults={
                                'activity_type': act_type,
                                'estimated_cost': act_cost
                            }
                        )

                    item_obj = None
                    if item_id_val and not str(item_id_val).startswith('17'):
                        try:
                            item_obj = ItineraryItems.objects.get(id=int(item_id_val), trip_stop__trip=instance)
                        except (ValueError, ItineraryItems.DoesNotExist):
                            pass

                    if item_obj:
                        item_obj.trip_stop = stop_obj
                        item_obj.activity = act_obj
                        item_obj.date = date_val
                        item_obj.start_time = start_time_val
                        item_obj.end_time = end_time_val
                        item_obj.sort_order = order_val
                        item_obj.save()
                    else:
                        item_obj = ItineraryItems.objects.create(
                            trip=instance,
                            trip_stop=stop_obj,
                            activity=act_obj,
                            date=date_val,
                            start_time=start_time_val,
                            end_time=end_time_val,
                            sort_order=order_val
                        )
                    keep_item_ids.append(item_obj.id)
                
                ItineraryItems.objects.filter(trip=instance).exclude(id__in=keep_item_ids).delete()

            # Update expenses
            if 'expenses' in request.data:
                new_expenses_data = request.data['expenses']
                keep_expense_ids = []
                for exp_data in new_expenses_data:
                    exp_id_val = exp_data.get('id')
                    title = exp_data.get('title')
                    amount = exp_data.get('amount')
                    category = exp_data.get('category', 'Other')
                    s_date_val = exp_data.get('expense_date') or instance.start_date
                    stop_id_val = exp_data.get('trip_stop_id')

                    stop_obj = temp_to_db_stop_ids.get(str(stop_id_val))
                    if not stop_obj and stop_id_val and not str(stop_id_val).startswith('17'):
                        try:
                            stop_obj = TripStops.objects.get(id=int(stop_id_val), trip=instance)
                        except (ValueError, TripStops.DoesNotExist):
                            pass

                    exp_obj = None
                    if exp_id_val and not str(exp_id_val).startswith('activity_exp_') and not str(exp_id_val).startswith('17'):
                        try:
                            exp_obj = Expenses.objects.get(id=int(exp_id_val), trip=instance)
                        except (ValueError, Expenses.DoesNotExist):
                            pass

                    if exp_obj:
                        exp_obj.amount = amount
                        exp_obj.category = category
                        exp_obj.description = title
                        exp_obj.expense_date = s_date_val
                        exp_obj.trip_stop = stop_obj
                        exp_obj.save()
                    else:
                        exp_obj = Expenses.objects.create(
                            trip=instance,
                            amount=amount,
                            category=category,
                            description=title,
                            expense_date=s_date_val,
                            trip_stop=stop_obj
                        )
                    keep_expense_ids.append(exp_obj.id)

                Expenses.objects.filter(trip=instance).exclude(id__in=keep_expense_ids).delete()

        return instance


class CitiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cities
        fields = ['id', 'name', 'country', 'region', 'cost_index', 'popularity', 'image_url']


class TripStopsSerializer(serializers.ModelSerializer):
    city = serializers.PrimaryKeyRelatedField(queryset=Cities.objects.all(), required=False, allow_null=True)
    city_detail = CitiesSerializer(source='city', read_only=True)
    city_name = serializers.CharField(write_only=True, required=False)
    country_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = TripStops
        fields = ['id', 'trip', 'city', 'city_detail', 'city_name', 'country_name', 'start_date', 'end_date', 'stop_order']
        read_only_fields = ['id', 'trip']

    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date is None and self.instance:
            start_date = self.instance.start_date
        if end_date is None and self.instance:
            end_date = self.instance.end_date

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError("End date must be greater than or equal to start date.")
        return data

    def create(self, validated_data):
        city_name = validated_data.pop('city_name', None)
        country_name = validated_data.pop('country_name', 'Unknown')
        city = validated_data.get('city')

        if city_name:
            city, _ = Cities.objects.get_or_create(
                name=city_name,
                defaults={'country': country_name}
            )
            validated_data['city'] = city

        if not validated_data.get('city'):
            raise serializers.ValidationError({"city": "This field or city_name is required."})

        return super().create(validated_data)

    def update(self, instance, validated_data):
        city_name = validated_data.pop('city_name', None)
        country_name = validated_data.pop('country_name', 'Unknown')
        
        if city_name:
            city, _ = Cities.objects.get_or_create(
                name=city_name,
                defaults={'country': country_name}
            )
            validated_data['city'] = city

        return super().update(instance, validated_data)


class ActivitiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activities
        fields = ['id', 'city', 'name', 'description', 'activity_type', 'duration_minutes', 'estimated_cost', 'image_url']


class ItineraryItemsSerializer(serializers.ModelSerializer):
    activity_detail = ActivitiesSerializer(source='activity', read_only=True)
    activity = serializers.PrimaryKeyRelatedField(queryset=Activities.objects.all(), required=False, allow_null=True)
    activity_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = ItineraryItems
        fields = ['id', 'trip', 'trip_stop', 'activity', 'activity_detail', 'activity_name', 'date', 'start_time', 'end_time', 'sort_order']
        read_only_fields = ['id', 'trip', 'trip_stop']

    def validate(self, data):
        start_time = data.get('start_time')
        end_time = data.get('end_time')

        if start_time is None and self.instance:
            start_time = self.instance.start_time
        if end_time is None and self.instance:
            end_time = self.instance.end_time

        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError("End time must be greater than start time.")
        return data

    def create(self, validated_data):
        activity_name = validated_data.pop('activity_name', None)
        activity = validated_data.get('activity')

        if activity_name:
            trip_stop = validated_data.get('trip_stop')
            city = trip_stop.city if trip_stop else None
            if not city:
                raise serializers.ValidationError({"activity_name": "Cannot resolve city for activity creation."})

            activity, _ = Activities.objects.get_or_create(
                name=activity_name,
                city=city
            )
            validated_data['activity'] = activity

        if not validated_data.get('activity'):
            raise serializers.ValidationError({"activity": "This field or activity_name is required."})

        return super().create(validated_data)

    def update(self, instance, validated_data):
        activity_name = validated_data.pop('activity_name', None)
        
        if activity_name:
            trip_stop = instance.trip_stop
            city = trip_stop.city if trip_stop else None
            if not city:
                raise serializers.ValidationError({"activity_name": "Cannot resolve city for activity creation."})

            activity, _ = Activities.objects.get_or_create(
                name=activity_name,
                city=city
            )
            validated_data['activity'] = activity

        return super().update(instance, validated_data)


class ExpensesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expenses
        fields = ['id', 'trip', 'trip_stop', 'category', 'description', 'amount', 'expense_date']
        read_only_fields = ['id', 'trip']

    def validate_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Expense amount cannot be negative.")
        return value
