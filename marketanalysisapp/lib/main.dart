import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'config/app_config.dart';
import 'core/theme/app_theme.dart';
import 'viewmodels/auth_viewmodel.dart' as auth_vm;
import 'viewmodels/market_viewmodel.dart';
import 'viewmodels/watchlist_viewmodel.dart';
import 'viewmodels/community_viewmodel.dart';
import 'viewmodels/alert_viewmodel.dart';
import 'viewmodels/notification_viewmodel.dart';
import 'views/home/main_navigation.dart';

import 'package:logging/logging.dart';

import 'dart:io';
import 'config/dev_http_overrides.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Enable hierarchical logging for SignalR
  hierarchicalLoggingEnabled = true;

  // Bypass SSL verification for development
  HttpOverrides.global = DevHttpOverrides();

  // Initialize Supabase
  await Supabase.initialize(
    url: AppConfig.supabaseUrl,
    anonKey: AppConfig.supabaseAnonKey,
  );

  runApp(const MarketAnalysisApp());
}

/// Main application widget
class MarketAnalysisApp extends StatelessWidget {
  const MarketAnalysisApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => auth_vm.AuthViewModel()),
        ChangeNotifierProvider(create: (_) => MarketViewModel()),
        ChangeNotifierProvider(create: (_) => WatchlistViewModel()),
        ChangeNotifierProvider(create: (_) => CommunityViewModel()),
        ChangeNotifierProvider(create: (_) => AlertViewModel()),
        ChangeNotifierProvider(create: (_) => NotificationViewModel()),
      ],
      child: MaterialApp(
        title: AppConfig.appName,
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        home: const AuthWrapper(),
      ),
    );
  }
}

/// Auth wrapper to determine which screen to show
class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<auth_vm.AuthViewModel>(
      builder: (context, authVM, _) {
        // Show loading while checking auth status
        if (authVM.state == auth_vm.AuthState.initial) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        // Show main navigation regardless of auth state (guest mode supported)
        return const MainNavigation();
      },
    );
  }
}
