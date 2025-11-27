import 'package:flutter/material.dart';
import 'dart:math' as math;

/// Gauge widget for displaying Fear & Greed Index
/// Rewritten to exactly match frontend SVG implementation
class FearGreedGauge extends StatelessWidget {
  final int value; // 0-100
  final String label;
  final double size;

  const FearGreedGauge({
    super.key,
    required this.value,
    required this.label,
    this.size = 120,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size * 0.65, // Further reduced height
      child: CustomPaint(
        painter: _GaugePainter(
          value: value.clamp(0, 100),
          label: label,
          size: size,
          textColor: Theme.of(context).colorScheme.onBackground,
        ),
      ),
    );
  }
}

class _GaugePainter extends CustomPainter {
  final int value;
  final String label;
  final double size;
  final Color textColor;

  _GaugePainter({
    required this.value,
    required this.label,
    required this.size,
    required this.textColor,
  });

  @override
  void paint(Canvas canvas, Size canvasSize) {
    final centerX = size / 2;
    final centerY = size * 0.4; // Moved up slightly
    final radius = (size - 16) / 2.5;
    const strokeWidth = 12.0;

    // Frontend uses: startAngle = Math.PI (180°), endAngle = 0
    const startAngle = math.pi; // 180° (left)
    const endAngle = 0.0; // 0° (right)
    const totalAngle = startAngle - endAngle; // Math.PI

    // Define 5 color segments - exactly as frontend
    final segments = [
      _SegmentConfig(0, 20, const Color(0xFFEA3943)), // Red - Extreme Fear
      _SegmentConfig(20, 40, const Color(0xFFF3A033)), // Orange - Fear
      _SegmentConfig(40, 60, const Color(0xFFF3D23E)), // Yellow - Neutral
      _SegmentConfig(60, 80, const Color(0xFF93D900)), // Light Green - Greed
      _SegmentConfig(80, 100, const Color(0xFF16C784)), // Green - Extreme Greed
    ];

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    // Draw segments - matching frontend's describeArc logic
    for (final segment in segments) {
      // Frontend: startAngle - (value / 100) * totalAngle
      final segmentStartAngle = startAngle - (segment.start / 100) * totalAngle;
      final segmentEndAngle = startAngle - (segment.end / 100) * totalAngle;

      // Get cartesian coordinates for start and end
      final startPos = _polarToCartesian(
        centerX,
        centerY,
        radius,
        segmentStartAngle,
      );
      final endPos = _polarToCartesian(
        centerX,
        centerY,
        radius,
        segmentEndAngle,
      );

      // Frontend SVG arc logic:
      // largeArcFlag = abs(startAngle - endAngle) > PI ? 1 : 0
      // sweepFlag = startAngle > endAngle ? 1 : 0
      final arcAngle = (segmentStartAngle - segmentEndAngle).abs();
      final sweepPositive = segmentStartAngle > segmentEndAngle;

      paint.color = segment.color;

      // Draw arc using Path (Flutter equivalent of SVG path)
      final path = Path();
      path.moveTo(startPos.dx, startPos.dy);
      path.arcToPoint(
        Offset(endPos.dx, endPos.dy),
        radius: Radius.circular(radius),
        largeArc: arcAngle > math.pi,
        clockwise: sweepPositive, // sweepFlag=1 means clockwise in SVG
      );

      canvas.drawPath(path, paint);
    }

    // Draw white pointer circle - matching frontend pointer position
    final valueAngle = startAngle - (value / 100) * totalAngle;
    final pointerPos = _polarToCartesian(centerX, centerY, radius, valueAngle);

    final pointerPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    final pointerBorderPaint = Paint()
      ..color = const Color(0xFF1a1a1a)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    canvas.drawCircle(
      Offset(pointerPos.dx, pointerPos.dy),
      strokeWidth * 0.6,
      pointerPaint,
    );
    canvas.drawCircle(
      Offset(pointerPos.dx, pointerPos.dy),
      strokeWidth * 0.6,
      pointerBorderPaint,
    );

    // Draw value text - centered
    final valueTextPainter = TextPainter(
      text: TextSpan(
        text: value.toString(),
        style: TextStyle(
          color: textColor,
          fontSize: size * 0.28, // Slightly larger
          fontWeight: FontWeight.bold,
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    valueTextPainter.layout();
    valueTextPainter.paint(
      canvas,
      Offset(
        centerX - valueTextPainter.width / 2,
        centerY -
            valueTextPainter.height / 2 -
            size * 0.05, // Moved up closer to gauge
      ),
    );

    // Draw label text - moved up further
    final labelTextPainter = TextPainter(
      text: TextSpan(
        text: label,
        style: TextStyle(
          color: textColor.withOpacity(0.6),
          fontSize: size * 0.1, // Slightly larger
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    labelTextPainter.layout();
    labelTextPainter.paint(
      canvas,
      Offset(
        centerX - labelTextPainter.width / 2,
        size * 0.6 - labelTextPainter.height / 2, // Moved up from 0.65
      ),
    );
  }

  // Exactly matching frontend's polarToCartesian
  Offset _polarToCartesian(
    double centerX,
    double centerY,
    double radius,
    double angleInRadians,
  ) {
    return Offset(
      centerX + radius * math.cos(angleInRadians),
      centerY - radius * math.sin(angleInRadians),
    );
  }

  @override
  bool shouldRepaint(_GaugePainter oldDelegate) {
    return oldDelegate.value != value || oldDelegate.label != label;
  }
}

class _SegmentConfig {
  final int start;
  final int end;
  final Color color;

  _SegmentConfig(this.start, this.end, this.color);
}
