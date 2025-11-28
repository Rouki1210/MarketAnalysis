import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../viewmodels/auth_viewmodel.dart';
import '../viewmodels/notification_viewmodel.dart';
import '../views/auth/auth_screens.dart';
import '../views/notifications/notifications_screen.dart';
import '../views/alerts/alerts_screen.dart';
import '../views/profile/profile_settings_screen.dart';

class UserMenuDrawer extends StatelessWidget {
  const UserMenuDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: AppColors.cardBackground,
      child: SafeArea(
        child: Consumer<AuthViewModel>(
          builder: (context, authVM, _) {
            return Column(
              children: [
                const SizedBox(height: 24),
                // User Header
                _buildUserHeader(context, authVM),

                const SizedBox(height: 24),
                const Divider(color: AppColors.border),

                // Menu Items
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    children: [
                      Consumer<NotificationViewModel>(
                        builder: (context, viewModel, child) {
                          return _buildMenuItem(
                            icon: Icons.notifications_outlined,
                            title: 'Notifications',
                            trailing: viewModel.unreadCount > 0
                                ? Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: const BoxDecoration(
                                      color: AppColors.error,
                                      shape: BoxShape.circle,
                                    ),
                                    child: Text(
                                      '${viewModel.unreadCount}',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  )
                                : null,
                            onTap: () {
                              Navigator.pop(context);
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => const NotificationsScreen(),
                                ),
                              );
                            },
                          );
                        },
                      ),
                      _buildMenuItem(
                        icon: Icons.add_alert_outlined,
                        title: 'Price Alerts',
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const AlertsScreen(),
                            ),
                          );
                        },
                      ),
                      _buildMenuItem(
                        icon: Icons.settings_outlined,
                        title: 'Settings',
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const ProfileSettingsScreen(),
                            ),
                          );
                        },
                      ),
                      _buildMenuItem(
                        icon: Icons.help_outline,
                        title: 'Help Center',
                        onTap: () {},
                      ),
                    ],
                  ),
                ),

                // Logout Button (only if logged in)
                if (authVM.isAuthenticated)
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: _buildLogoutButton(context, authVM),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildUserHeader(BuildContext context, AuthViewModel authVM) {
    if (authVM.isAuthenticated) {
      final user = authVM.currentUser;
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(
          children: [
            CircleAvatar(
              radius: 40,
              backgroundColor: AppColors.primaryAccent.withValues(alpha: 0.2),
              backgroundImage: user?.profilePictureUrl != null
                  ? NetworkImage(user!.profilePictureUrl!)
                  : null,
              child: user?.profilePictureUrl == null
                  ? const Icon(
                      Icons.person,
                      size: 40,
                      color: AppColors.primaryAccent,
                    )
                  : null,
            ),
            const SizedBox(height: 16),
            Text(
              user?.displayName ?? 'User',
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            if (user?.email != null) ...[
              const SizedBox(height: 4),
              Text(
                user!.email,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ],
        ),
      );
    }

    // Guest State
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          CircleAvatar(
            radius: 40,
            backgroundColor: AppColors.textSecondary.withValues(alpha: 0.2),
            child: const Icon(
              Icons.person_outline,
              size: 40,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.pop(context); // Close drawer
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const LoginScreen(),
                      ),
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.border),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    'Log in',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context); // Close drawer
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const SignupScreen(),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryAccent,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    'Sign up',
                    style: TextStyle(color: Colors.black),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Widget? trailing,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppColors.textSecondary),
      title: Text(
        title,
        style: const TextStyle(color: Colors.white, fontSize: 16),
      ),
      trailing:
          trailing ??
          const Icon(Icons.chevron_right, color: AppColors.textTertiary),
      onTap: onTap,
    );
  }

  Widget _buildLogoutButton(BuildContext context, AuthViewModel authVM) {
    return InkWell(
      onTap: () {
        authVM.logout();
        Navigator.pop(context); // Close drawer
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
        decoration: BoxDecoration(
          color: AppColors.primaryBackground,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Row(
          children: [
            Text(
              'Log Out',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            Spacer(),
            Icon(Icons.logout, color: AppColors.textSecondary),
          ],
        ),
      ),
    );
  }
}
