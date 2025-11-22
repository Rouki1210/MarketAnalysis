import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../viewmodels/auth_viewmodel.dart';
import '../core/theme/app_colors.dart';

class ProfileButton extends StatelessWidget {
  const ProfileButton({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthViewModel>(
      builder: (context, authVM, _) {
        return IconButton(
          icon: CircleAvatar(
            radius: 14,
            backgroundColor: AppColors.textSecondary.withValues(alpha: 0.2),
            backgroundImage: authVM.currentUser?.profilePictureUrl != null
                ? NetworkImage(authVM.currentUser!.profilePictureUrl!)
                : null,
            child: authVM.currentUser?.profilePictureUrl == null
                ? Icon(
                    Icons.person,
                    size: 18,
                    color: authVM.isAuthenticated
                        ? AppColors.primaryAccent
                        : AppColors.textSecondary,
                  )
                : null,
          ),
          onPressed: () {
            Scaffold.of(context).openEndDrawer();
          },
        );
      },
    );
  }
}
