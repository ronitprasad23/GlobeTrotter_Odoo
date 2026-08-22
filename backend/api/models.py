from django.db import models


class Activities(models.Model):
    city = models.ForeignKey('Cities', models.DO_NOTHING)
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    activity_type = models.CharField(max_length=50, blank=True, null=True)
    duration_minutes = models.IntegerField(blank=True, null=True)
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    image_url = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'activities'


class Cities(models.Model):
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    region = models.CharField(max_length=100, blank=True, null=True)
    cost_index = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    popularity = models.IntegerField(blank=True, null=True)
    image_url = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'cities'


class Expenses(models.Model):
    trip = models.ForeignKey('Trips', models.DO_NOTHING)
    trip_stop = models.ForeignKey('TripStops', models.DO_NOTHING, blank=True, null=True)
    category = models.CharField(max_length=50)
    description = models.CharField(max_length=200, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    expense_date = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'expenses'


class ItineraryItems(models.Model):
    trip = models.ForeignKey('Trips', models.DO_NOTHING)
    trip_stop = models.ForeignKey('TripStops', models.DO_NOTHING)
    activity = models.ForeignKey(Activities, models.DO_NOTHING)
    date = models.DateField()
    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)
    sort_order = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'itinerary_items'


class TripStops(models.Model):
    trip = models.ForeignKey('Trips', models.DO_NOTHING)
    city = models.ForeignKey(Cities, models.DO_NOTHING)
    start_date = models.DateField()
    end_date = models.DateField()
    stop_order = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'trip_stops'
        unique_together = (('trip', 'stop_order'),)


class Trips(models.Model):
    user = models.ForeignKey('Users', models.DO_NOTHING)
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    cover_image = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'trips'


class Users(models.Model):
    name = models.CharField(max_length=100)
    email = models.CharField(unique=True, max_length=150)
    password_hash = models.TextField()
    profile_image = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'users'
