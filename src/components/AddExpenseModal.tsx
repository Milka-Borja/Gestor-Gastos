import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Category, CATEGORIES, CATEGORY_ICONS, Expense } from '@/types/expense';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { useExpenses } from '@/context/ExpenseContext';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onClose,
  expenseToEdit,
}) => {
  const { addExpense, editExpense } = useExpenses();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [invoiceUri, setInvoiceUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      setDescription(expenseToEdit.description || '');
      setDate(new Date(expenseToEdit.date));
      setInvoiceUri(expenseToEdit.invoiceUri);
    } else {
      resetForm();
    }
  }, [expenseToEdit, visible]);

  const resetForm = () => {
    setAmount('');
    setCategory(null);
    setDescription('');
    setDate(new Date());
    setInvoiceUri(undefined);
  };

  // Solo números y hasta dos decimales
  const handleAmountChange = (text: string) => {
    const normalizedText = text.replace(',', '.');
    if (normalizedText === '' || /^\d+(\.\d{0,2})?$/.test(normalizedText)) {
      setAmount(normalizedText);
    }
  };

  // Solo letras, números y espacios (hasta 400 caracteres)
  const handleDescriptionChange = (text: string) => {
    const cleanedText = text.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    setDescription(cleanedText);
  };

  const handlePickImage = async () => {
    Alert.alert('Adjuntar Factura / Comprobante', 'Elige una opción:', [
      {
        text: 'Cámara',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara para tomar fotos.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.7,
          });
          if (!result.canceled && result.assets[0].uri) {
            setInvoiceUri(result.assets[0].uri);
          }
        },
      },
      {
        text: 'Galería',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permiso requerido', 'Se necesita acceso a la galería.');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
          });
          if (!result.canceled && result.assets[0].uri) {
            setInvoiceUri(result.assets[0].uri);
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (!amount.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(
        'Monto inválido',
        'El campo monto es obligatorio, debe ser mayor a 0 y contener solo números con máximo dos decimales.'
      );
      return;
    }

    if (!category) {
      Alert.alert(
        'Categoría requerida',
        'Debes seleccionar una categoría para registrar el gasto, este campo es obligatorio.'
      );
      return;
    }

    if (!date) {
      Alert.alert('Fecha requerida', 'El campo de fecha es obligatorio.');
      return;
    }

    // Validación: la fecha no puede ser posterior a la fecha actual
    const now = new Date();
    if (date > now) {
      Alert.alert(
        'Fecha inválida',
        'La fecha del gasto no puede ser posterior a la fecha actual.'
      );
      return;
    }

    if (description.length > 400) {
      Alert.alert(
        'Descripción demasiado larga',
        'La descripción no puede superar los 400 caracteres.'
      );
      return;
    }

    try {
      const finalDescription = description.trim() ? description.trim() : undefined;
      const finalInvoiceUri = invoiceUri ? invoiceUri : undefined;

      if (expenseToEdit) {
        await editExpense({
          ...expenseToEdit,
          amount: parsedAmount,
          category,
          date,
          description: finalDescription,
          invoiceUri: finalInvoiceUri,
        });
      } else {
        await addExpense({
          amount: parsedAmount,
          category,
          date,
          description: finalDescription,
          invoiceUri: finalInvoiceUri,
        });
      }
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error al guardar el gasto', error);
      Alert.alert('Error', 'No se pudo guardar el gasto. Intenta nuevamente.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
          <Animated.View entering={FadeIn} style={styles.backdropBlur}>
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View entering={SlideInDown.springify()} style={styles.modalContent}>
          <BlurView intensity={35} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.modalBackground}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.handleBar} />
              <Text style={styles.title}>{expenseToEdit ? 'Editar Gasto' : 'Agregar Gasto'}</Text>

              {/* Monto Obligatorio */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Monto (USD) *</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={handleAmountChange}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                  />
                </View>
                <Text style={styles.helperText}>Solo números y hasta dos decimales</Text>
              </View>

              {/* Fecha Obligatoria (con restricción de fecha máxima) */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Fecha del Gasto *</Text>
                <TouchableOpacity
                  style={styles.datePickerBtn}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    📅 {date.toLocaleDateString('es-EC', { dateStyle: 'long' })}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    maximumDate={new Date()}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) setDate(selectedDate);
                    }}
                  />
                )}
              </View>

              {/* Categoría Obligatoria */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Categoría *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={[
                        styles.categoryButton,
                        category === cat && styles.categoryButtonActive,
                      ]}
                    >
                      <Text style={styles.categoryIcon}>{CATEGORY_ICONS[cat]}</Text>
                      <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Comprobante / Factura (Opcional) */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Comprobante / Factura (Opcional)</Text>
                {invoiceUri ? (
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: invoiceUri }} style={styles.imagePreview} />
                    <TouchableOpacity style={styles.removeImageBtn} onPress={() => setInvoiceUri(undefined)}>
                      <Text style={styles.removeImageText}>✕ Eliminar comprobante</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
                    <Text style={styles.uploadText}>📷 Tomar Foto o Subir Factura</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Descripción (Opcional) */}
              <View style={styles.inputSection}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Descripción (Opcional)</Text>
                  <Text style={styles.counterText}>{description.length}/400</Text>
                </View>
                <TextInput
                  style={[styles.inputContainer, styles.descriptionInput]}
                  value={description}
                  onChangeText={handleDescriptionChange}
                  placeholder="Solo letras y números..."
                  placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                  maxLength={400}
                  multiline
                />
              </View>

              {/* Botones de acción */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.submitGradient}
                  >
                    <Text style={styles.submitButtonText}>
                      {expenseToEdit ? 'Actualizar' : 'Guardar'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill },
  backdropBlur: { flex: 1 },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: '90%',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: LiquidGlassColors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  modalBackground: {
    padding: Spacing.four,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  scrollContent: { paddingBottom: Spacing.four },
  handleBar: {
    width: 44,
    height: 5,
    backgroundColor: 'rgba(139, 107, 143, 0.35)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  inputSection: { marginBottom: Spacing.three },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one + 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.one + 2,
  },
  counterText: { fontSize: 12, color: LiquidGlassColors.glassTextSecondary },
  helperText: {
    fontSize: 11,
    color: LiquidGlassColors.glassTextSecondary,
    marginTop: Spacing.one,
    marginLeft: Spacing.half,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: LiquidGlassColors.secondary,
    marginRight: Spacing.one + 2,
  },
  input: { flex: 1, height: 46, fontSize: 16, color: LiquidGlassColors.glassText },
  datePickerBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
  },
  dateText: { fontSize: 15, color: LiquidGlassColors.glassText },
  categoriesContent: { gap: Spacing.two, paddingVertical: Spacing.one },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    minWidth: 80,
  },
  categoryButtonActive: {
    backgroundColor: LiquidGlassColors.secondary,
    borderColor: LiquidGlassColors.secondary,
  },
  categoryIcon: { fontSize: 20, marginBottom: Spacing.half },
  categoryText: { fontSize: 12, color: LiquidGlassColors.glassTextSecondary },
  categoryTextActive: { color: LiquidGlassColors.glassTextLight, fontWeight: 'bold' },
  uploadButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: LiquidGlassColors.glassBorder,
    alignItems: 'center',
  },
  uploadText: { color: LiquidGlassColors.secondary, fontWeight: '600' },
  previewContainer: { alignItems: 'center' },
  imagePreview: { width: '100%', height: 160, borderRadius: Spacing.two, resizeMode: 'cover' },
  removeImageBtn: { marginTop: Spacing.one + 2 },
  removeImageText: { color: LiquidGlassColors.secondary, fontWeight: '600', fontSize: 13 },
  descriptionInput: { minHeight: 70, textAlignVertical: 'top', paddingVertical: Spacing.two },
  buttonContainer: { flexDirection: 'row', gap: Spacing.two + 4, marginTop: Spacing.two },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
  },
  cancelButtonText: { color: LiquidGlassColors.glassText, fontWeight: '600' },
  submitButton: {
    flex: 1,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  submitButtonText: { color: LiquidGlassColors.glassTextLight, fontWeight: 'bold' },
});