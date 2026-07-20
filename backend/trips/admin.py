from django.contrib import admin

from trips.models import Trip, TripMember, GroceryItem, PersonalItem, TripNote, GroceryList, PersonalList

# Register your models here.
admin.site.register(Trip)
admin.site.register(TripMember)
admin.site.register(GroceryList)
admin.site.register(GroceryItem)
admin.site.register(PersonalList)
admin.site.register(PersonalItem)
admin.site.register(TripNote)