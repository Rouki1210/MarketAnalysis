import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_colors.dart';
import '../../models/user_alert_model.dart';

class CreateAlertDialog extends StatefulWidget {
  final int assetId;
  final double currentPrice;
  final String symbol;

  const CreateAlertDialog({
    super.key,
    required this.assetId,
    required this.currentPrice,
    required this.symbol,
  });

  @override
  State<CreateAlertDialog> createState() => _CreateAlertDialogState();
}

class _CreateAlertDialogState extends State<CreateAlertDialog> {
  final _formKey = GlobalKey<FormState>();
  final _priceController = TextEditingController();
  final _noteController = TextEditingController();
  String _alertType = 'ABOVE';
  bool _isRepeating = false;

  @override
  void initState() {
    super.initState();
    _priceController.text = widget.currentPrice.toString();
  }

  @override
  void dispose() {
    _priceController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Set Alert for ${widget.symbol}'),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Current Price: \$${widget.currentPrice.toStringAsFixed(2)}',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 16),

              // Alert Type Dropdown
              DropdownButtonFormField<String>(
                value: _alertType,
                decoration: const InputDecoration(
                  labelText: 'Condition',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(
                    value: 'ABOVE',
                    child: Text('Price goes above'),
                  ),
                  DropdownMenuItem(
                    value: 'BELOW',
                    child: Text('Price goes below'),
                  ),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      _alertType = value;
                    });
                  }
                },
              ),
              const SizedBox(height: 16),

              // Target Price Field
              TextFormField(
                controller: _priceController,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
                ],
                decoration: const InputDecoration(
                  labelText: 'Target Price',
                  prefixText: '\$ ',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a price';
                  }
                  final price = double.tryParse(value);
                  if (price == null || price <= 0) {
                    return 'Invalid price';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Note Field
              TextFormField(
                controller: _noteController,
                maxLength: 40,
                decoration: const InputDecoration(
                  labelText: 'Note (Optional)',
                  hintText: 'e.g. Sell target',
                  border: OutlineInputBorder(),
                ),
              ),

              // Repeating Checkbox
              CheckboxListTile(
                title: const Text('Repeating Alert'),
                subtitle: const Text('Keep alert active after triggering'),
                value: _isRepeating,
                onChanged: (value) {
                  setState(() {
                    _isRepeating = value ?? false;
                  });
                },
                contentPadding: EdgeInsets.zero,
                controlAffinity: ListTileControlAffinity.leading,
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () {
            if (_formKey.currentState!.validate()) {
              final alert = CreateUserAlert(
                assetId: widget.assetId,
                alertType: _alertType,
                targetPrice: double.parse(_priceController.text),
                isRepeating: _isRepeating,
                note: _noteController.text.isEmpty
                    ? null
                    : _noteController.text,
              );
              Navigator.of(context).pop(alert);
            }
          },
          child: const Text('Create Alert'),
        ),
      ],
    );
  }
}
