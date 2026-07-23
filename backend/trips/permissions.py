from rest_framework import permissions

class TripAccessPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        trip = getattr(obj, "trip", None)

        if trip is None and hasattr(obj, "grocery_list"):
            trip = obj.grocery_list.trip
            obj = obj.grocery_list

        if trip is None and hasattr(obj, "personal_list"):
            trip = obj.personal_list.trip
            obj = obj.personal_list

        if trip is None:
            trip = obj

        membership = None
        if request.user.is_authenticated:
            membership = trip.memberships.filter(user=request.user).first()

        if request.method in permissions.SAFE_METHODS:
            return bool(trip.is_public) or membership is not None

        if membership is None:
            return False

        if getattr(membership, "is_organizer", False):
            return True

        creator = getattr(obj, "created_by", None) or getattr(obj, "added_by", None)
        return creator == request.user