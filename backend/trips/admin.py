from django.contrib import admin

from trips.models import Trip, TripMember, GroceryItem, PersonalItem, TripNote

# Register your models here.
admin.site.register(Trip)
admin.site.register(TripMember)
admin.site.register(GroceryItem)
admin.site.register(PersonalItem)
admin.site.register(TripNote)