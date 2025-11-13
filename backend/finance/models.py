from django.db import models
from django.contrib.auth.models import User
from django.conf import settings



class Category(models.Model):
    CATEGORY_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, null=True, choices=CATEGORY_TYPES)
    icon = models.CharField(max_length=10, default='💼')  # Add this field

    def __str__(self):
        return f"{self.name} ({self.type})"


class Transaction(models.Model):
    PAYMENT_MODES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('upi', 'UPI'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_mode = models.CharField(max_length=10, choices=PAYMENT_MODES)
    description = models.TextField(blank=True, null=True)
    date = models.DateField()

    def __str__(self):
        return f"{self.category} - ₹{self.amount} ({self.date})"

User = settings.AUTH_USER_MODEL

class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey('Category', on_delete=models.CASCADE, related_name='budgets')
    month = models.DateField(help_text="Use first day of month to represent month")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'category', 'month')
        ordering = ['-month']

    def __str__(self):
        return f"{self.user} | {self.category} | {self.month:%Y-%m} = {self.amount}"


class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=128)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    target_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def progress_percent(self):
        if self.target_amount == 0:
            return 0
        return min(100, (self.current_amount / self.target_amount) * 100)

    def __str__(self):
        return f"{self.title} ({self.progress_percent():.1f}%)"
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)  # store image

    def __str__(self):
        return self.user.username
    
