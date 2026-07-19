from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Trip(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(
        max_length=200,
        blank=True,
        help_text="Human-readable place name, trailhead, campsite, or region.",
    )
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)

    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(-90),
            MaxValueValidator(90),
        ],
        help_text="Latitude in decimal degrees, for example 47.250376",
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(-180),
            MaxValueValidator(180),
        ],
        help_text="Longitude in decimal degrees, for example -79.890442",
    )

    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through="TripMember",
        related_name="trips",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_date", "name"]

    def __str__(self):
        if self.location:
            return f"{self.name} ({self.location})"
        return self.name

    @property
    def has_coordinates(self):
        return self.latitude is not None and self.longitude is not None


class TripMember(models.Model):
    class Role(models.TextChoices):
        ORGANIZER = "organizer", "Organizer"
        MEMBER = "member", "Member"

    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="trip_memberships",
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.MEMBER,
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("trip", "user")
        ordering = ["trip", "user__username"]

    def __str__(self):
        return f"{self.user} - {self.trip} ({self.role})"


class GroceryItem(models.Model):
    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name="grocery_items",
    )
    name = models.CharField(max_length=200)
    quantity = models.CharField(max_length=100, blank=True)
    is_packed = models.BooleanField(default=False)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="added_grocery_items",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class PersonalItem(models.Model):
    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name="personal_items",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="personal_items",
    )
    name = models.CharField(max_length=200)
    quantity = models.CharField(max_length=100, blank=True)
    is_packed = models.BooleanField(default=False)
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["user__username", "name"]

    def __str__(self):
        return f"{self.user} - {self.name}"


class TripNote(models.Model):
    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name="notes",
    )
    title = models.CharField(max_length=200)
    body = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="trip_notes",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title