import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Alert,
} from "react-native";
import { db } from "../database/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore";

import FormularioProductos from "../Components/FormularioProductos.js";
import TablaProductos from "../Components/TablaProductos.js";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";

const colecciones = ["productos", "usuarios", "edades", "ciudades"];

const Productos = ({ cerrarSesion }) => {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoId, setProductoId] = useState(null);
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: "", precio: "" });

  // === MANEJO DEL FORMULARIO ===
  const manejoCambio = (campo, valor) => {
    setNuevoProducto((prev) => ({ ...prev, [campo]: valor }));
  };

  const limpiarFormulario = () => {
    setNuevoProducto({ nombre: "", precio: "" });
    setModoEdicion(false);
    setProductoId(null);
  };

  const guardarProducto = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio) {
      Alert.alert("Error", "Complete todos los campos");
      return;
    }
    await addDoc(collection(db, "productos"), {
      nombre: nuevoProducto.nombre,
      precio: parseFloat(nuevoProducto.precio),
    });
    limpiarFormulario();
    cargarDatos();
  };

  const actualizarProducto = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio) {
      Alert.alert("Error", "Complete todos los campos");
      return;
    }
    await updateDoc(doc(db, "productos", productoId), {
      nombre: nuevoProducto.nombre,
      precio: parseFloat(nuevoProducto.precio),
    });
    limpiarFormulario();
    cargarDatos();
  };

  // === CARGA DE PRODUCTOS (PASO 3) ===
  const cargarDatos = async () => {
    try {
      const snap = await getDocs(collection(db, "productos"));
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProductos(lista);
    } catch (e) {
      console.error("Error cargando productos:", e);
    }
  };

  const eliminarProducto = async (id) => {
    await deleteDoc(doc(db, "productos", id));
    cargarDatos();
  };

  const editarProducto = (p) => {
    setNuevoProducto({ nombre: p.nombre, precio: p.precio.toString() });
    setProductoId(p.id);
    setModoEdicion(true);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // === FUNCIÓN GENÉRICA: CARGAR UNA COLECCIÓN (PASO 7b) ===
  const cargarColeccion = async (nombre) => {
    try {
      const snap = await getDocs(collection(db, nombre));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error(`Error en colección ${nombre}:`, e);
      return [];
    }
  };

  // === CARGAR TODAS LAS COLECCIONES (PASO 7b) ===
  const cargarDatosFirebase = async () => {
    const resultado = {};
    for (const col of colecciones) {
      resultado[col] = await cargarColeccion(col);
    }
    return resultado;
  };

  // === EXPORTAR DATOS (PASO 4) ===
  const exportarDatos = async (datos, nombreArchivo = "datos.txt") => {
    try {
      const texto = JSON.stringify(datos, null, 2);

      // 1. Copiar al portapapeles
      await Clipboard.setStringAsync(texto);
      Alert.alert("¡Copiado!", "Datos en el portapapeles");

      // 2. Guardar y compartir
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Compartir no disponible");
        return;
      }

      const uri = FileSystem.cacheDirectory + nombreArchivo;
      await FileSystem.writeAsStringAsync(uri, texto);
      await Sharing.shareAsync(uri, {
        mimeType: "text/plain",
        dialogTitle: "Datos Firebase",
      });
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  // === EXPORTAR SÓLO PRODUCTOS (PASO 6) ===
  const exportarProductos = async () => {
    const datos = await cargarColeccion("productos");
    await exportarDatos(datos, "productos.txt");
  };

  // === EXPORTAR TODAS LAS COLECCIONES (PASO 7c) ===
  const exportarTodo = async () => {
    const datos = await cargarDatosFirebase();
    await exportarDatos(datos, "TODAS_las_colecciones.txt");
  };

  // === BOTÓN REUTILIZABLE (PASO 6) ===
  const BotonExportar = ({ titulo, onPress, color = "#0066cc" }) => (
    <View style={{ marginVertical: 6 }}>
      <Button title={titulo} color={color} onPress={onPress} />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Button title="Cerrar Sesión" onPress={cerrarSesion} color="#dc3545" />

      {/* === BOTONES DE EXPORTACIÓN (PASO 5 y 6) === */}
      <View style={styles.exportSection}>
        <Text style={styles.tituloExport}>📤 EXPORTAR DATOS</Text>

        <BotonExportar titulo="Exportar Productos" onPress={exportarProductos} />
        <BotonExportar titulo="Exportar Usuarios" onPress={() => exportarDatos(colecciones[1], "usuarios.txt")} />
        <BotonExportar titulo="Exportar Edades"   onPress={() => exportarDatos(colecciones[2], "edades.txt")} />
        <BotonExportar titulo="Exportar Ciudades" onPress={() => exportarDatos(colecciones[3], "ciudades.txt")} />

        <View style={{ marginTop: 12 }}>
          <Button title="🚀 EXPORTAR TODO" color="#28a745" onPress={exportarTodo} />
        </View>
      </View>

      {/* === FORMULARIO === */}
      <FormularioProductos
        nuevoProducto={nuevoProducto}
        manejoCambio={manejoCambio}
        guardarProducto={guardarProducto}
        actualizarProducto={actualizarProducto}
        modoEdicion={modoEdicion}
      />

      {/* === TABLA === */}
      <TablaProductos
        productos={productos}
        editarProducto={editarProducto}
        eliminarProducto={eliminarProducto}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
  exportSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginVertical: 15,
    elevation: 4,
  },
  tituloExport: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#343a40",
  },
});

export default Productos;