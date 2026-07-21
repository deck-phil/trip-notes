import requests
from django.contrib.auth import logout, login, authenticate
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import generics, permissions, views, response, status
from .models import Trip, TripNote, PersonalList, GroceryList, GroceryItem, PersonalItem
from .serializers import TripSerializer, NoteSerializer, \
    TripWeatherSerializer, CurrentUserSerializer, TripListSerializer, GroceryListSerializer, PersonalListSerializer, \
    GroceryItemSerializer, PersonalItemSerializer
from .weather_service import get_trip_weather


## User Management ##
@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfTokenView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return response.Response({"detail": "CSRF cookie set"})


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username", "").strip()
        password = request.data.get("password", "")

        if not username or not password:
            return response.Response(
                {"detail": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=username, password=password)
        if user is None:
            return response.Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        login(request, user)

        serializer = CurrentUserSerializer(user)
        return response.Response(
            {"user": serializer.data},
            status=status.HTTP_200_OK,
        )


class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return response.Response(
            {"detail": "Logged out successfully."},
            status=status.HTTP_200_OK,
        )


class CurrentUserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = CurrentUserSerializer(request.user)
        return response.Response(
            {"user": serializer.data},
            status=status.HTTP_200_OK,
        )


## Trip Management ##


class TripListView(generics.ListAPIView):
    serializer_class = TripListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Trip.objects
            .filter(memberships__user=self.request.user)
            .distinct()
            .order_by("start_date", "name")
        )


class TripDetailView(generics.RetrieveAPIView):
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Trip.objects
            .filter(memberships__user=self.request.user)
            .distinct()
        )


class TripGroceryListDetailView(generics.RetrieveAPIView):
    serializer_class = GroceryListSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "grocery_list_id"

    def get_queryset(self):
        trip_id = self.kwargs["trip_id"]
        return (
            GroceryList.objects
            .filter(trip_id=trip_id)
            .select_related("created_by")
            .prefetch_related("items", "items__added_by")
            .order_by("created_at", "name")
        )


class TripGroceryItemCreateView(generics.CreateAPIView):
    serializer_class = GroceryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_grocery_list(self):
        return generics.get_object_or_404(
            GroceryList.objects.filter(trip_id=self.kwargs["trip_id"]),
            id=self.kwargs["grocery_list_id"],
        )

    def perform_create(self, serializer):
        serializer.save(
            grocery_list=self.get_grocery_list(),
            added_by=self.request.user,
        )


class TripGroceryItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GroceryItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "item_id"

    def get_queryset(self):
        return (
            GroceryItem.objects
            .filter(
                grocery_list_id=self.kwargs["grocery_list_id"],
                grocery_list__trip_id=self.kwargs["trip_id"],
            )
            .select_related("added_by", "grocery_list")
            .order_by("name")
        )


class TripNoteDetailView(generics.RetrieveAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "note_id"

    def get_queryset(self):
        trip_id = self.kwargs["trip_id"]
        return (
            TripNote.objects
            .filter(trip_id=trip_id)
            .select_related("created_by")
            .order_by("-created_at")
        )


class TripPersonalListDetailView(generics.RetrieveAPIView):
    serializer_class = PersonalListSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "personal_list_id"

    def get_queryset(self):
        trip_id = self.kwargs["trip_id"]
        return (
            PersonalList.objects
            .filter(trip_id=trip_id)
            .select_related("created_by")
            .prefetch_related("items")
            .order_by("-created_at", "name")
        )


class TripPersonalItemCreateView(generics.CreateAPIView):
    serializer_class = PersonalItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_personal_list(self):
        return generics.get_object_or_404(
            PersonalList.objects.filter(trip_id=self.kwargs["trip_id"]),
            id=self.kwargs["personal_list_id"],
        )

    def perform_create(self, serializer):
        serializer.save(
            personal_list=self.get_personal_list(),
        )


class TripPersonalItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PersonalItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "item_id"

    def get_queryset(self):
        return (
            PersonalItem.objects
            .filter(
                personal_list_id=self.kwargs["personal_list_id"],
                personal_list__trip_id=self.kwargs["trip_id"],
            )
            .select_related("personal_list")
            .order_by("name")
        )


class TripWeatherView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, trip_id):
        try:
            trip = Trip.objects.get(pk=trip_id)
        except Trip.DoesNotExist:
            return response.Response({"detail": "Trip not found."}, status=status.HTTP_404_NOT_FOUND, )

        if trip.latitude is None or trip.longitude is None:
            return response.Response({"detail": "Trip does not have latitude/longitude set."},
                                     status=status.HTTP_400_BAD_REQUEST, )

        if trip.start_date > trip.end_date:
            return response.Response({"detail": "Trip dates are invalid."}, status=status.HTTP_400_BAD_REQUEST, )

        try:
            weather_data = get_trip_weather(
                latitude=float(trip.latitude),
                longitude=float(trip.longitude),
                start_date=trip.start_date,
                end_date=trip.end_date,
            )
        except requests.RequestException:
            return response.Response({"detail": "Could not load weather forecast."},
                                     status=status.HTTP_502_BAD_GATEWAY, )

        serializer = TripWeatherSerializer(weather_data)
        return response.Response(serializer.data)
