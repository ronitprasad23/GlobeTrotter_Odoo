from django.urls import path
from .views import (
    health_check, signup_view, login_view,
    trips_list_create_view, trips_detail_view, public_trip_detail_view,
    cities_list_view, trip_stops_list_create_view, trip_stops_detail_view
)

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('auth/signup/', signup_view, name='signup'),
    path('auth/login/', login_view, name='login'),
    path('trips/', trips_list_create_view, name='trips-list-create'),
    path('trips/<int:pk>/', trips_detail_view, name='trips-detail'),
    path('trips/public/<int:pk>/', public_trip_detail_view, name='public-trip-detail'),
    path('cities/', cities_list_view, name='cities-list'),
    path('trips/<int:trip_id>/stops/', trip_stops_list_create_view, name='trip-stops-list-create'),
    path('trips/<int:trip_id>/stops/<int:stop_id>/', trip_stops_detail_view, name='trip-stops-detail'),
]
