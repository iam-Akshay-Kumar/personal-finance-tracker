from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet,income_stats, TransactionViewSet, BudgetViewSet, GoalViewSet, RegisterView, ProfileView

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('transactions', TransactionViewSet, basename='transaction')
router.register('budgets', BudgetViewSet, basename='budget')
router.register('goals', GoalViewSet, basename='goal')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),  
    path('income-stats/', income_stats, name='income-stats'), 
] + router.urls