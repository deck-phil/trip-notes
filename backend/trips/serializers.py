# trips/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Trip, GroceryItem, TripNote, PersonalItem, TripMember, PersonalList, GroceryList


class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


class TripListSerializer(serializers.ModelSerializer):
    is_organizer = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            "id",
            "name",
            "location",
            "start_date",
            "end_date",
            "is_active",
            "is_organizer",
        ]

    def get_is_organizer(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            return False

        return obj.memberships.filter(
            user=user,
            role=TripMember.Role.ORGANIZER,
        ).exists()


class TripGroceryListSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = GroceryList
        fields = [
            "id",
            "name",
            "created_at",
        ]
        read_only_fields = fields


class TripPersonalListSummarySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = PersonalList
        fields = [
            "id",
            "name",
            "user",
            "username",
            "created_at",
        ]
        read_only_fields = fields


class TripNoteRefSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripNote
        fields = ["id", "title"]
        read_only_fields = fields


class TripSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)
    is_member = serializers.SerializerMethodField()
    is_organizer = serializers.SerializerMethodField()
    grocery_lists = TripGroceryListSummarySerializer(many=True, read_only=True)
    personal_lists = TripPersonalListSummarySerializer(many=True, read_only=True)
    notes = TripNoteRefSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = [
            "id",
            "name",
            "location",
            "description",
            "start_date",
            "end_date",
            "latitude",
            "longitude",
            "is_member",
            "is_organizer",
            "grocery_lists",
            "personal_lists",
            "notes",
        ]

    def _get_membership(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        return obj.memberships.filter(user=request.user).first()

    def get_is_member(self, obj):
        return self._get_membership(obj) is not None

    def get_is_organizer(self, obj):
        membership = self._get_membership(obj)
        return bool(
            membership and membership.role == TripMember.Role.ORGANIZER
        )


class GroceryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroceryItem
        fields = [
            "id",
            "name",
            "quantity",
            "is_packed",
        ]
        read_only_fields = ["id"]


class GroceryListSerializer(serializers.ModelSerializer):
    items = GroceryItemSerializer(many=True, read_only=True)

    class Meta:
        model = GroceryList
        fields = [
            "id",
            "name",
            "trip",
            "created_by",
            "created_at",
            "items",
        ]
        read_only_fields = ["id", "created_at"]


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripNote
        fields = [
            "id",
            "title",
            "body",
            "created_at",
            "updated_at",
            "trip",
            "created_by",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class PersonalItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalItem
        fields = [
            "id",
            "name",
            "quantity",
            "notes",
            "is_packed",
        ]
        read_only_fields = ["id"]


class PersonalListSerializer(serializers.ModelSerializer):
    items = PersonalItemSerializer(many=True, read_only=True)

    class Meta:
        model = PersonalList
        fields = [
            "id",
            "name",
            "trip",
            "user",
            "created_at",
            "items",
        ]
        read_only_fields = ["id", "created_at"]


class WeatherCurrentSerializer(serializers.Serializer):
    time = serializers.CharField(allow_null=True)
    temperature = serializers.FloatField(allow_null=True)
    temperature_unit = serializers.CharField(allow_null=True)
    weather_code = serializers.IntegerField(allow_null=True)
    weather_label = serializers.CharField(allow_null=True)
    wind_speed = serializers.FloatField(allow_null=True)
    wind_speed_unit = serializers.CharField(allow_null=True)


class WeatherDaySerializer(serializers.Serializer):
    date = serializers.CharField()
    weather_code = serializers.IntegerField(allow_null=True)
    weather_label = serializers.CharField(allow_null=True)
    temperature_max = serializers.FloatField(allow_null=True)
    temperature_min = serializers.FloatField(allow_null=True)
    precipitation_sum = serializers.FloatField(allow_null=True)
    wind_speed_max = serializers.FloatField(allow_null=True)
    sunrise = serializers.CharField(allow_null=True)
    sunset = serializers.CharField(allow_null=True)


class TripWeatherSerializer(serializers.Serializer):
    latitude = serializers.FloatField(allow_null=True)
    longitude = serializers.FloatField(allow_null=True)
    timezone = serializers.CharField(allow_null=True)
    timezone_abbreviation = serializers.CharField(allow_null=True)
    current = WeatherCurrentSerializer()
    daily_units = serializers.DictField()
    days = WeatherDaySerializer(many=True)
