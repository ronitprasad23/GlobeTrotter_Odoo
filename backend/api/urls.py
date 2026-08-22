from django.urls import path
from .views import health_check, signup_view, login_view

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('auth/signup/', signup_view, name='signup'),
    path('auth/login/', login_view, name='login'),
]
