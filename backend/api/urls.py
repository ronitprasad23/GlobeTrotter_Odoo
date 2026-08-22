from django.urls import path
from .views import (
    health_check, signup_view, login_view,
    trips_list_create_view, trips_detail_view
)

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('auth/signup/', signup_view, name='signup'),
    path('auth/login/', login_view, name='login'),
    path('trips/', trips_list_create_view, name='trips-list-create'),
    path('trips/<int:pk>/', trips_detail_view, name='trips-detail'),
]
