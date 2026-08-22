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
        
        stops_qs = TripStops.objects.filter(trip=instance).order_by('stop_order')
        stops_list = []
        for stop in stops_qs:
            activities_qs = ItineraryItems.objects.filter(trip_stop=stop).order_by('sort_order')
            activities_names = [item.activity.name for item in activities_qs if item.activity]
            stops_list.append({
                "id": str(stop.id),
                "city": stop.city.name if stop.city else "",
                "country": stop.city.country if stop.city else "",
                "start_date": stop.start_date.isoformat() if stop.start_date else None,
                "end_date": stop.end_date.isoformat() if stop.end_date else None,
                "activities": activities_names
            })
        ret['stops'] = stops_list

        expenses_qs = Expenses.objects.filter(trip=instance)
        expenses_list = []
        for exp in expenses_qs:
            expenses_list.append({
                "id": str(exp.id),
                "title": exp.description or exp.category,
                "amount": float(exp.amount),
                "category": exp.category
            })
        ret['expenses'] = expenses_list
        return ret

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        request = self.context.get('request')
        
        if request and request.data:
            if 'stops' in request.data:
                new_stops_data = request.data['stops']
                keep_stop_ids = []
                for order, stop_data in enumerate(new_stops_data, start=1):
                    stop_id_val = stop_data.get('id')
                    city_name = stop_data.get('city')
                    country_name = stop_data.get('country', 'Unknown')
                    s_date = stop_data.get('start_date') or instance.start_date
                    e_date = stop_data.get('end_date') or instance.end_date

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

                    ItineraryItems.objects.filter(trip_stop=stop_obj).delete()
                    activities_list = stop_data.get('activities', [])
                    for idx, act_name in enumerate(activities_list, start=1):
                        act_obj, _ = Activities.objects.get_or_create(
                            city=city_obj,
                            name=act_name
                        )
                        ItineraryItems.objects.create(
                            trip=instance,
                            trip_stop=stop_obj,
                            activity=act_obj,
                            date=stop_obj.start_date,
                            sort_order=idx
                        )

                TripStops.objects.filter(trip=instance).exclude(id__in=keep_stop_ids).delete()

            if 'expenses' in request.data:
                new_expenses_data = request.data['expenses']
                keep_expense_ids = []
                for exp_data in new_expenses_data:
                    exp_id_val = exp_data.get('id')
                    title = exp_data.get('title')
                    amount = exp_data.get('amount')
                    category = exp_data.get('category', 'Other')

                    exp_obj = None
                    if exp_id_val and not str(exp_id_val).startswith('17'):
                        try:
                            exp_obj = Expenses.objects.get(id=int(exp_id_val), trip=instance)
                        except (ValueError, Expenses.DoesNotExist):
                            pass

                    if exp_obj:
                        exp_obj.amount = amount
                        exp_obj.category = category
                        exp_obj.description = title
                        exp_obj.save()
                    else:
                        exp_obj = Expenses.objects.create(
                            trip=instance,
                            amount=amount,
                            category=category,
                            description=title
                        )
                    keep_expense_ids.append(exp_obj.id)

                Expenses.objects.filter(trip=instance).exclude(id__in=keep_expense_ids).delete()

        return instance
