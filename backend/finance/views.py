from rest_framework import viewsets, permissions, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Category, Transaction, Budget, Goal
from .serializers import CategorySerializer, TransactionSerializer, BudgetSerializer, GoalSerializer, RegisterSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Sum
from datetime import datetime, timedelta

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def income_stats(request):
    user = request.user
    
    income_categories = Category.objects.filter(user=user, type='income')
    
    thirty_days_ago = datetime.now().date() - timedelta(days=30)
    transactions = Transaction.objects.filter(
        user=user,
        category__type='income',
        date__gte=thirty_days_ago
    ).values('date').annotate(total=Sum('amount')).order_by('date')
    
    income_by_category = Transaction.objects.filter(
        user=user,
        category__type='income'
    ).values(
        'category__name',
        'category__icon',
        'date'
    ).annotate(total=Sum('amount')).order_by('-date')
    
    return Response({
        'chart_data': list(transactions),
        'income_sources': list(income_by_category)
    })

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            profile_pic_url = None
            if user.profile.profile_pic:
                profile_pic_url = request.build_absolute_uri(user.profile.profile_pic.url)
            return Response({
                "username": user.username,
                "email": user.email,
                "id": user.id,
                "profile_pic": profile_pic_url
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        try:
            if user.profile.profile_pic:
                profile_pic_url = request.build_absolute_uri(user.profile.profile_pic.url)
            else:
                profile_pic_url = None
        except:
            profile_pic_url = None
        
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_pic": profile_pic_url
        })