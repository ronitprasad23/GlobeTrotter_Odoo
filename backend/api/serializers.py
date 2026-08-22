from rest_framework import serializers
from .models import Trips

class TripsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trips
        fields = ['id', 'user', 'name', 'description', 'start_date', 'end_date', 'cover_image', 'created_at']
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
