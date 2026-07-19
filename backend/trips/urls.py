# trips/urls.py
from django.urls import path
from .api_views import TripListView, TripDetailView, TripGroceryListView, TripNoteListView, TripPersonalItemListView, TripWeatherView, LoginView, LogoutView, CurrentUserView, CsrfTokenView

urlpatterns = [
    path("auth/csrf/", CsrfTokenView.as_view(), name="api-csrf"),
    path("auth/login/", LoginView.as_view(), name="api-login"),
    path("auth/logout/", LogoutView.as_view(), name="api-logout"),
    path("auth/me/", CurrentUserView.as_view(), name="api-current-user"),

    path("trips/", TripListView.as_view(), name="trip-list"),
    path("trips/<int:pk>/", TripDetailView.as_view(), name="trip-detail"),
    path("trips/<int:trip_id>/groceries/", TripGroceryListView.as_view(), name="trip-groceries"),
    path("trips/<int:trip_id>/notes/", TripNoteListView.as_view(), name="trip-notes"),
    path("trips/<int:trip_id>/personal-items/", TripPersonalItemListView.as_view(), name="trip-personal-items"),
    path("trips/<int:trip_id>/weather/", TripWeatherView.as_view(), name="trip-weather"),
]
