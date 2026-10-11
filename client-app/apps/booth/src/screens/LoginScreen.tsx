import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { isDemoMode } from '@happypix/api';
import { cameraManager } from '../../../../packages/camera-core/src/index';
import { printerManager } from '../../../../packages/printer-core/src/index';
import { useBooth } from '../context/BoothProvider';
import { AppLogo } from '../components/AppLogo';
import {
  fontSize,
  moderateScale,
  scale,
  verticalScale,
} from '../../../../packages/ui/src/index';
import SoundManager from '../utils/SoundManager';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;
type CheckStatus = 'checking' | 'ok' | 'failed';

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, bootError } = useBooth();
  const demo = isDemoMode();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > 700;

  const [email, setEmail] = useState(demo ? 'booth@happypix.in' : '');
  const [password, setPassword] = useState(demo ? 'demo123' : '');
  const [locationLabel, setLocationLabel] = useState('Main Kiosk');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(bootError);

  // Hardware Status State
  const [cameraStatus, setCameraStatus] = useState<CheckStatus>('checking');
  const [cameraName, setCameraName] = useState('Checking camera…');
  const [printerStatus, setPrinterStatus] = useState<CheckStatus>('checking');
  const [printerName, setPrinterName] = useState('Checking printer…');
  const [networkStatus, setNetworkStatus] = useState<CheckStatus>('ok');

  useEffect(() => {
    let mounted = true;

    const probeHardware = async () => {
      // 1. Camera check
      try {
        const type = await cameraManager.autoSelect();
        if (!mounted) return;
        setCameraName(type ? `${type.toUpperCase()} Camera (Ready)` : 'Integrated Tablet Cam');
        setCameraStatus('ok');
      } catch {
        if (!mounted) return;
        setCameraName('Camera Simulator / Standby');
        setCameraStatus('failed');
      }

      // 2. Printer check
      try {
        const devices = await printerManager.discover();
        if (!mounted) return;
        if (devices.length > 0) {
          setPrinterName(devices[0].name || 'High-Speed Dye-Sub Printer');
          setPrinterStatus('ok');
        } else {
          setPrinterName('Printer Simulator / Standby');
          setPrinterStatus('failed');
        }
      } catch {
        if (!mounted) return;
        setPrinterName('Printer Simulator / Standby');
        setPrinterStatus('failed');
      }
    };

    probeHardware();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    SoundManager.play('click');
    try {
      const { isLive } = await login({
        email: email.trim(),
        password,
        locationLabel: locationLabel.trim() || 'Tablet Booth',
      });

      SoundManager.play('success');
      if (isLive) {
        navigation.replace('Start');
      } else {
        navigation.replace('Waiting');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const statusChips: { label: string; value: string; ok: boolean }[] = [
    { label: 'Camera', value: cameraName, ok: cameraStatus === 'ok' },
    { label: 'Printer', value: printerName, ok: printerStatus === 'ok' },
    { label: 'Network', value: networkStatus === 'ok' ? 'Online' : 'Offline', ok: networkStatus === 'ok' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View pointerEvents="none" style={[styles.glow, styles.glowTop]} />
      <View pointerEvents="none" style={[styles.glow, styles.glowBottom]} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { width: isLandscape ? Math.min(width * 0.5, 520) : Math.min(width * 0.92, 520) }]}>
          <View style={styles.brandRow}>
            <AppLogo width={150} height={46} forceDark />
          </View>

          <Text style={styles.title}>Pair this booth</Text>
          <Text style={styles.subtitle}>
            Sign in with your organisation admin account to link this tablet. Once paired, it stays linked
            to this booth until it is removed from the CRM.
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.fieldLabel}>Admin email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="name@organisation.com"
            placeholderTextColor="#6b6578"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.fieldLabel}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor="#6b6578"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.showToggle}
              onPress={() => setShowPassword((value) => !value)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            >
              <Text style={styles.showToggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Booth location</Text>
          <TextInput
            style={styles.input}
            value={locationLabel}
            onChangeText={setLocationLabel}
            placeholder="e.g. Main stage, Hall A"
            placeholderTextColor="#6b6578"
            autoCapitalize="words"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnBusy]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.submitBtnText}>Connecting…</Text>
              </View>
            ) : (
              <Text style={styles.submitBtnText}>Pair booth</Text>
            )}
          </TouchableOpacity>

          {demo ? (
            <Text style={styles.demoHint}>Demo: booth@happypix.in · demo123</Text>
          ) : null}
        </View>

        <View style={styles.chipRow}>
          {statusChips.map((chip) => (
            <View key={chip.label} style={[styles.chip, chip.ok ? styles.chipOk : styles.chipWarn]}>
              <View style={[styles.chipDot, chip.ok ? styles.dotOk : styles.dotWarn]} />
              <Text style={styles.chipLabel}>{chip.label}</Text>
              <Text style={styles.chipValue} numberOfLines={1}>{chip.value}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.footer}>HappyPix Booth · {Math.round(width)} × {Math.round(height)}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080611' },
  glow: { position: 'absolute', width: 520, height: 520, borderRadius: 260, opacity: 0.18 },
  glowTop: { top: -180, left: -140, backgroundColor: '#ec4899' },
  glowBottom: { bottom: -200, right: -160, backgroundColor: '#7c3aed' },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: verticalScale(28), paddingHorizontal: scale(16) },
  card: {
    padding: scale(28),
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  brandRow: { alignItems: 'center', marginBottom: verticalScale(18) },
  title: { color: '#ffffff', fontSize: fontSize(26), fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#a1a1aa', fontSize: fontSize(13), lineHeight: fontSize(19), textAlign: 'center', marginTop: verticalScale(8), marginBottom: verticalScale(18) },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.14)', borderColor: 'rgba(239,68,68,0.35)', borderWidth: 1, borderRadius: 12, padding: scale(12), marginBottom: verticalScale(12) },
  errorText: { color: '#fca5a5', fontSize: fontSize(13), textAlign: 'center' },
  fieldLabel: { color: '#d4d4d8', fontSize: fontSize(12), fontWeight: '600', marginBottom: verticalScale(6), marginTop: verticalScale(10) },
  input: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    color: '#ffffff',
    fontSize: fontSize(16),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(12),
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, paddingRight: scale(64) },
  showToggle: { position: 'absolute', right: scale(10), paddingHorizontal: scale(10), paddingVertical: verticalScale(6) },
  showToggleText: { color: '#f9a8d4', fontSize: fontSize(13), fontWeight: '700' },
  submitBtn: { marginTop: verticalScale(22), backgroundColor: '#ec4899', borderRadius: 14, paddingVertical: verticalScale(14), alignItems: 'center' },
  submitBtnBusy: { opacity: 0.7 },
  submitBtnText: { color: '#ffffff', fontSize: fontSize(16), fontWeight: '800' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: scale(8) },
  demoHint: { color: '#71717a', fontSize: fontSize(12), textAlign: 'center', marginTop: verticalScale(14) },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: scale(10), marginTop: verticalScale(20), maxWidth: 560 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: scale(6), borderRadius: 999, paddingVertical: verticalScale(7), paddingHorizontal: scale(12), borderWidth: 1, maxWidth: 260 },
  chipOk: { borderColor: 'rgba(34,197,94,0.35)', backgroundColor: 'rgba(34,197,94,0.08)' },
  chipWarn: { borderColor: 'rgba(245,158,11,0.35)', backgroundColor: 'rgba(245,158,11,0.08)' },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  dotOk: { backgroundColor: '#22c55e' },
  dotWarn: { backgroundColor: '#f59e0b' },
  chipLabel: { color: '#e4e4e7', fontSize: fontSize(12), fontWeight: '700' },
  chipValue: { color: '#a1a1aa', fontSize: fontSize(12), flexShrink: 1 },
  footer: { color: '#52525b', fontSize: fontSize(11), marginTop: verticalScale(18) },
});
