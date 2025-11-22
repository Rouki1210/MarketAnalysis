import 'package:flutter_test/flutter_test.dart';

import 'package:marketanalysisapp/main.dart';

void main() {
  testWidgets('App initialization test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MarketAnalysisApp());

    // Verify that the welcome screen is displayed
    expect(find.text('Market Analysis'), findsOneWidget);
    expect(find.text('Your Crypto Market Companion'), findsOneWidget);
  });
}
