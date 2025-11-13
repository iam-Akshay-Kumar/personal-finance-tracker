from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Transaction, Budget, Goal, Profile

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'user', 'name', 'type', 'icon']

class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Transaction
        fields = '__all__'

class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Budget
        fields = '__all__'


class GoalSerializer(serializers.ModelSerializer):
    progress_percent = serializers.FloatField(read_only=True)
    class Meta:
        model = Goal
        fields = '__all__'

class RegisterSerializer(serializers.ModelSerializer):
    profile_pic = serializers.ImageField(required=False, allow_null=True, source='profile.profile_pic')
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'profile_pic']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        profile_pic = profile_data.get('profile_pic', None)
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        if profile_pic:
            Profile.objects.update_or_create(
                user=user,
                defaults={'profile_pic': profile_pic}
            )
        else:
            Profile.objects.get_or_create(user=user)
        
        return user