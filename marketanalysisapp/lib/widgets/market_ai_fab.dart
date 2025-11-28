import 'package:flutter/material.dart';
import 'dart:ui';

/// Floating Action Button for Market AI Analysis
class MarketAiFab extends StatelessWidget {
  final VoidCallback onPressed;

  const MarketAiFab({Key? key, required this.onPressed}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(28),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: FloatingActionButton(
          onPressed: onPressed,
          backgroundColor: Theme.of(
            context,
          ).colorScheme.primary.withOpacity(0.3),
          elevation: 0,
          child: Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.5),
                width: 2,
              ),
            ),
            alignment: Alignment.center,
            child: const Text('🤖', style: TextStyle(fontSize: 28)),
          ),
        ),
      ),
    );
  }
}
