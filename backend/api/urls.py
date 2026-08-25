from django.urls import path
from .views import (
    health_check, signup_view, login_view, profile_update_view,
    trips_list_create_view, trips_detail_view, public_trip_detail_view,
    cities_list_view, trip_stops_list_create_view, trip_stops_detail_view,
    activities_list_create_view, itinerary_list_create_view, itinerary_detail_view,
    expenses_list_create_view, expenses_detail_view
)

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('auth/signup/', signup_view, name='signup'),
    path('auth/login/', login_view, name='login'),
    path('auth/profile/', profile_update_view, name='profile-update'),
    path('trips/', trips_list_create_view, name='trips-list-create'),
    path('trips/<int:pk>/', trips_detail_view, name='trips-detail'),
    path('trips/public/<int:pk>/', public_trip_detail_view, name='public-trip-detail'),
    path('cities/', cities_list_view, name='cities-list'),
    path('trips/<int:trip_id>/stops/', trip_stops_list_create_view, name='trip-stops-list-create'),
    path('trips/<int:trip_id>/stops/<int:stop_id>/', trip_stops_detail_view, name='trip-stops-detail'),
    path('activities/', activities_list_create_view, name='activities-list-create'),
    path('trips/<int:trip_id>/stops/<int:stop_id>/itinerary/', itinerary_list_create_view, name='itinerary-list-create'),
    path('trips/<int:trip_id>/stops/<int:stop_id>/itinerary/<int:item_id>/', itinerary_detail_view, name='itinerary-detail'),
    path('trips/<int:trip_id>/expenses/', expenses_list_create_view, name='expenses-list-create'),
    path('trips/<int:trip_id>/expenses/<int:expense_id>/', expenses_detail_view, name='expenses-detail'),
]
