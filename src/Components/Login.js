import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../database/firebaseConfig';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordInputRef = useRef(null);

  // Validación de email
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const manejarLogin = async () => {
    Keyboard.dismiss();

    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Por favor completa ambos campos.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Email inválido', 'Ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onLoginSuccess();
    } catch (error) {
      let mensaje = 'Error al iniciar sesión. Inténtalo de nuevo.';

      switch (error.code) {
        case 'auth/invalid-email':
          mensaje = 'El correo no tiene un formato válido.';
          break;
        case 'auth/user-not-found':
          mensaje = 'No existe una cuenta con este correo.';
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          mensaje = 'Credenciales incorrectas.';
          break;
        case 'auth/too-many-requests':
          mensaje = 'Demasiados intentos. Intenta más tarde.';
          break;
        case 'auth/network-request-failed':
          mensaje = 'Error de conexión. Revisa tu internet.';
          break;
        default:
          mensaje = 'Error inesperado. Intenta de nuevo.';
      }

      Alert.alert('Error', mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Iniciar Sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => passwordInputRef.current?.focus()}
        blurOnSubmit={false}
        accessibilityLabel="Correo electrónico"
        testID="email-input"
      />

      <TextInput
        ref={passwordInputRef}
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        returnKeyType="done"
        onSubmitEditing={manejarLogin}
        accessibilityLabel="Contraseña"
        testID="password-input"
      />

      <TouchableOpacity
        style={[styles.boton, loading && styles.botonDeshabilitado]}
        onPress={manejarLogin}
        disabled={loading}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Iniciar sesión"
        testID="login-button"
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.textoBoton}>Entrar</Text>
        )}
      </TouchableOpacity>

      {/* Opcional: Enlace para recuperar contraseña */}
      <TouchableOpacity
        style={styles.enlace}
        onPress={() => Alert.alert('Info', 'Función en desarrollo')}
        accessibilityLabel="Olvidé mi contraseña"
      >
        <Text style={styles.textoEnlace}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#212529',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ced4da',
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  boton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  botonDeshabilitado: {
    backgroundColor: '#6c757d',
    opacity: 0.65,
  },
  textoBoton: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  enlace: {
    marginTop: 16,
    alignSelf: 'center',
  },
  textoEnlace: {
    color: '#007bff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default Login;