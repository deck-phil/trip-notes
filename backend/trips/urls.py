# trips/urls.py
from django.urls import path
from .api_views import TripListView, TripDetailView, TripGroceryListDetailView, \
    TripWeatherView, LoginView, LogoutView, CurrentUserView, CsrfTokenView, TripNoteDetailView, \
    TripPersonalListDetailView

urlpatterns = [
    path("auth/csrf/", CsrfTokenView.as_view(), name="api-csrf"),
    path("auth/login/", LoginView.as_view(), name="api-login"),
    path("auth/logout/", LogoutView.as_view(), name="api-logout"),
    path("auth/me/", CurrentUserView.as_view(), name="api-current-user"),

    path("trips/", TripListView.as_view(), name="trip-list"),
    path("trips/<uuid:pk>/", TripDetailView.as_view(), name="trip-detail"),
    path("trips/<uuid:trip_id>/groceries/<int:grocery_list_id>/", TripGroceryListDetailView.as_view(), name="trip-grocery-list-detail"),
    path("trips/<uuid:trip_id>/notes/<int:note_id>/", TripNoteDetailView.as_view(), name="trip-note-detail"),
    path("trips/<uuid:trip_id>/personal-lists/<int:personal_list_id>/", TripPersonalListDetailView.as_view(), name="trip-personal-list-detail"),
    path("trips/<uuid:trip_id>/weather/", TripWeatherView.as_view(), name="trip-weather"),
]
