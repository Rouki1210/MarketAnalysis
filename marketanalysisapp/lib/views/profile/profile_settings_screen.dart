import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../viewmodels/auth_viewmodel.dart';
import '../../core/theme/app_colors.dart';

/// Profile Settings Screen
class ProfileSettingsScreen extends StatefulWidget {
  const ProfileSettingsScreen({Key? key}) : super(key: key);

  @override
  State<ProfileSettingsScreen> createState() => _ProfileSettingsScreenState();
}

class _ProfileSettingsScreenState extends State<ProfileSettingsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _displayNameController = TextEditingController();
  final _usernameController = TextEditingController();
  final _bioController = TextEditingController();
  final _birthdayController = TextEditingController();
  final _websiteController = TextEditingController();

  bool _isLoading = false;
  bool _isLoadingData = true;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  @override
  void dispose() {
    _displayNameController.dispose();
    _usernameController.dispose();
    _bioController.dispose();
    _birthdayController.dispose();
    _websiteController.dispose();
    super.dispose();
  }

  Future<void> _loadUserData() async {
    final authVM = context.read<AuthViewModel>();
    final user = authVM.currentUser;

    if (user != null) {
      setState(() {
        _displayNameController.text = user.displayName ?? '';
        _usernameController.text = user.username ?? '';
        _bioController.text = user.bio ?? '';
        _birthdayController.text = user.birthday != null
            ? '${(user.birthday as DateTime).day.toString().padLeft(2, '0')}/${(user.birthday as DateTime).month.toString().padLeft(2, '0')}/${(user.birthday as DateTime).year}'
            : '';
        _websiteController.text = user.website ?? '';
        _isLoadingData = false;
      });
    } else {
      setState(() => _isLoadingData = false);
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    // Convert dd/mm/yyyy to DateTime for backend
    DateTime? birthdayDate;
    if (_birthdayController.text.isNotEmpty) {
      try {
        final parts = _birthdayController.text.split('/');
        if (parts.length == 3) {
          birthdayDate = DateTime(
            int.parse(parts[2]), // year
            int.parse(parts[1]), // month
            int.parse(parts[0]), // day
          );
        }
      } catch (e) {
        // Invalid date format
      }
    }

    final authVM = context.read<AuthViewModel>();
    final success = await authVM.updateProfile(
      displayName: _displayNameController.text.trim(),
      bio: _bioController.text.trim(),
      birthday: birthdayDate?.toIso8601String(),
      website: _websiteController.text.trim(),
    );

    setState(() => _isLoading = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            success
                ? 'Profile updated successfully!'
                : 'Failed to update profile',
          ),
          backgroundColor: success ? AppColors.success : AppColors.error,
        ),
      );
    }
  }

  Future<void> _pickBirthday() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );

    if (date != null) {
      setState(() {
        _birthdayController.text =
            '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryBackground,
      appBar: AppBar(title: const Text('Profile')),
      body: _isLoadingData
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // About Me Section
                    const Text(
                      'About me',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Avatar Section
                    _buildAvatarSection(),
                    const SizedBox(height: 24),

                    // Display Name
                    _buildTextField(
                      label: 'Display name',
                      controller: _displayNameController,
                      maxLength: 20,
                      hint: 'Enter your display name',
                    ),
                    const SizedBox(height: 16),

                    // Username
                    _buildTextField(
                      label: 'Username',
                      controller: _usernameController,
                      maxLength: 20,
                      hint: 'Enter your username',
                      enabled: false,
                      helperText:
                          '* Username can only be changed once per 7 days',
                    ),
                    const SizedBox(height: 16),

                    // Bio
                    _buildTextField(
                      label: 'Bio',
                      controller: _bioController,
                      maxLength: 250,
                      maxLines: 5,
                      hint: 'A brief introduction about yourself',
                    ),
                    const SizedBox(height: 16),

                    // Birthday
                    _buildDateField(),
                    const SizedBox(height: 16),

                    // Website
                    _buildTextField(
                      label: 'Website',
                      controller: _websiteController,
                      maxLength: 100,
                      hint: 'Add your website',
                      keyboardType: TextInputType.url,
                    ),
                    const SizedBox(height: 32),

                    // Save Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _saveProfile,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryAccent,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation(
                                    Colors.white,
                                  ),
                                ),
                              )
                            : const Text(
                                'Save',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildAvatarSection() {
    final authVM = context.watch<AuthViewModel>();
    final user = authVM.currentUser;
    final initial = user?.displayName?.isNotEmpty == true
        ? user!.displayName![0].toUpperCase()
        : user?.username?.isNotEmpty == true
        ? user!.username![0].toUpperCase()
        : 'U';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Your Avatar',
          style: TextStyle(fontSize: 13, color: Colors.white70),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            // Avatar Circle
            CircleAvatar(
              radius: 32,
              backgroundColor: AppColors.primaryAccent,
              child: Text(
                initial,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
            const SizedBox(width: 16),
            // Edit Button
            OutlinedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Avatar editing coming soon!')),
                );
              },
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.primaryAccent),
              ),
              child: const Text('Edit'),
            ),
            const SizedBox(width: 12),
            // Get Avatar Frame
            TextButton(
              onPressed: () {},
              child: const Text('Get Avatar Frame ›'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    int? maxLength,
    int? maxLines = 1,
    String? hint,
    String? helperText,
    bool enabled = true,
    TextInputType? keyboardType,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          maxLength: maxLength,
          maxLines: maxLines,
          enabled: enabled,
          keyboardType: keyboardType,
          style: TextStyle(color: enabled ? Colors.white : Colors.white54),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Colors.white38),
            helperText: helperText,
            helperStyle: const TextStyle(color: Colors.white54, fontSize: 11),
            filled: true,
            fillColor: enabled
                ? AppColors.cardBackground
                : AppColors.cardBackground.withOpacity(0.5),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(
                color: AppColors.primaryAccent,
                width: 2,
              ),
            ),
            counterStyle: const TextStyle(color: Colors.white54, fontSize: 11),
          ),
        ),
      ],
    );
  }

  Widget _buildDateField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Birthday',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _birthdayController,
          readOnly: true,
          onTap: _pickBirthday,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: 'dd/mm/yyyy',
            hintStyle: const TextStyle(color: Colors.white38),
            filled: true,
            fillColor: AppColors.cardBackground,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(
                color: AppColors.primaryAccent,
                width: 2,
              ),
            ),
            suffixIcon: const Icon(Icons.calendar_today, color: Colors.white54),
          ),
        ),
      ],
    );
  }
}
