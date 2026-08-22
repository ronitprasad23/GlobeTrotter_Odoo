import re
from datetime import datetime
from django.db import connection
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Users, Trips, Cities, TripStops, Activities, ItineraryItems, Expenses
from .utils import generate_jwt_token
from .serializers import TripsSerializer, CitiesSerializer, TripStopsSerializer, ActivitiesSerializer, ItineraryItemsSerializer, ExpensesSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    health_status = {
        "status": "healthy",
        "database": "disconnected",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    try:
        connection.ensure_connection()
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        
        health_status["database"] = "connected"
        return Response(health_status, status=status.HTTP_200_OK)
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["error"] = str(e)
        return Response(health_status, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    name = request.data.get('name')
    email = request.data.get('email')
    password = request.data.get('password')
    profile_image = request.data.get('profile_image', '')

    if not name or not email or not password:
        return Response(
            {"error": "name, email, and password are required fields"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
        return Response(
            {"error": "Invalid email address format"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if Users.objects.filter(email=email).exists():
        return Response(
            {"error": "A user with this email already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        hashed_password = make_password(password)
        user = Users.objects.create(
            name=name,
            email=email,
            password_hash=hashed_password,
            profile_image=profile_image
        )
        
        token = generate_jwt_token(user)
        return Response({
            "message": "User registered successfully",
            "token": token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "profile_image": user.profile_image,
                "created_at": user.created_at
            }
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {"error": f"Failed to create user: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response(
            {"error": "email and password are required fields"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = Users.objects.get(email=email)
    except Users.DoesNotExist:
        return Response(
            {"error": "Invalid email or password"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not check_password(password, user.password_hash):
        return Response(
            {"error": "Invalid email or password"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    token = generate_jwt_token(user)
    return Response({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "profile_image": user.profile_image,
            "created_at": user.created_at
        }
    }, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def trips_list_create_view(request):
    if request.method == 'GET':
        trips = Trips.objects.filter(user=request.user)
        serializer = TripsSerializer(trips, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = TripsSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def trips_detail_view(request, pk):
    try:
        trip = Trips.objects.get(pk=pk, user=request.user)
    except Trips.DoesNotExist:
        return Response({"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = TripsSerializer(trip)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        serializer = TripsSerializer(trip, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        trip.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([AllowAny])
def public_trip_detail_view(request, pk):
    try:
        trip = Trips.objects.get(pk=pk, is_public=True)
    except Trips.DoesNotExist:
        return Response({"error": "Public trip not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = TripsSerializer(trip)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def cities_list_view(request):
    if request.method == 'GET':
        cities = Cities.objects.all().order_by('name')
        serializer = CitiesSerializer(cities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = CitiesSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trip_stops_list_create_view(request, trip_id):
    try:
        trip = Trips.objects.get(pk=trip_id, user=request.user)
    except Trips.DoesNotExist:
        return Response({"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = TripStopsSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(trip=trip)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def trip_stops_detail_view(request, trip_id, stop_id):
    try:
        trip = Trips.objects.get(pk=trip_id, user=request.user)
    except Trips.DoesNotExist:
        return Response({"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        stop = TripStops.objects.get(pk=stop_id, trip=trip)
    except TripStops.DoesNotExist:
        return Response({"error": "Trip stop not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = TripStopsSerializer(stop, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        stop.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def activities_list_create_view(request):
    if request.method == 'GET':
        city_id = request.query_params.get('city_id')
        if city_id:
            activities = Activities.objects.filter(city_id=city_id)
        else:
            activities = Activities.objects.all()
        serializer = ActivitiesSerializer(activities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = ActivitiesSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def itinerary_list_create_view(request, trip_id, stop_id):
    try:
        trip = Trips.objects.get(pk=trip_id, user=request.user)
    except Trips.DoesNotExist:
        return Response({"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        stop = TripStops.objects.get(pk=stop_id, trip=trip)
    except TripStops.DoesNotExist:
        return Response({"error": "Trip stop not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        items = ItineraryItems.objects.filter(trip_stop=stop).order_by('sort_order')
        serializer = ItineraryItemsSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = ItineraryItemsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(trip=trip, trip_stop=stop)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def itinerary_detail_view(request, trip_id, stop_id, item_id):
    try:
        trip = Trips.objects.get(pk=trip_id, user=request.user)
    except Trips.DoesNotExist:
        return Response({"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        stop = TripStops.objects.get(pk=stop_id, trip=trip)
    except TripStops.DoesNotExist:
        return Response({"error": "Trip stop not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        item = ItineraryItems.objects.get(pk=item_id, trip_stop=stop)
    except ItineraryItems.DoesNotExist:
        return Response({"error": "Itinerary item not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = ItineraryItemsSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def expenses_list_create_view(request, trip_id):
    try:
        trip = Trips.objects.get(pk=trip_id, user=request.user)
    except Trips.DoesNotExist:
        return Response({"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        expenses = Expenses.objects.filter(trip=trip)
        serializer = ExpensesSerializer(expenses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = ExpensesSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(trip=trip)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def expenses_detail_view(request, trip_id, expense_id):
    try:
        trip = Trips.objects.get(pk=trip_id, user=request.user)
    except Trips.DoesNotExist:
        return Response({"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        expense = Expenses.objects.get(pk=expense_id, trip=trip)
    except Expenses.DoesNotExist:
        return Response({"error": "Expense not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = ExpensesSerializer(expense, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        expense.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


