// src/view/ProductosRealtime.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { realtimeDB } from "../database/firebaseConfig";
import {
  ref,
  push,
  set,
  onValue,
  remove,
  update,
} from "firebase/database";

const ProductosRealtime = () => {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [editId, setEditId] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const productosRef = ref(realtimeDB, "productos");

  const guardarProducto = () => {
    if (!nombre || !precio || !cantidad) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    if (editId) {
      const productoRef = ref(realtimeDB, `productos/${editId}`);
      set(productoRef, {
        nombre,
        precio: parseFloat(precio),
        cantidad: parseInt(cantidad),
      })
        .then(() => {
          Alert.alert("Éxito", "Producto actualizado");
          limpiar();
        })
        .catch(() => Alert.alert("Error", "No se pudo actualizar"));
    } else {
      const nuevo = push(productosRef);
      set(nuevo, {
        nombre,
        precio: parseFloat(precio),
        cantidad: parseInt(cantidad),
      })
        .then(() => {
          Alert.alert("Éxito", "Producto guardado");
          limpiar();
        })
        .catch(() => Alert.alert("Error", "No se pudo guardar"));
    }
  };

  const limpiar = () => {
    setNombre("");
    setPrecio("");
    setCantidad("");
    setEditId(null);
  };

  const editar = (id, p) => {
    setNombre(p.nombre);
    setPrecio(p.precio.toString());
    setCantidad(p.cantidad.toString());
    setEditId(id);
  };

  const eliminar = (id) => {
    Alert.alert("Confirmar", "¿Eliminar este producto?", [
      { text: "Cancelar" },
      {
        text: "Eliminar",
        onPress: () => {
          remove(ref(realtimeDB, `productos/${id}`))
            .then(() => Alert.alert("Eliminado"))
            .catch(() => Alert.alert("Error"));
        },
      },
    ]);
  };

  useEffect(() => {
    const unsubscribe = onValue(productosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.entries(data).map(([id, valor]) => ({
          id,
          ...valor,
        }));
        setProductos(lista);
      } else {
        setProductos([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Gestión de Productos (Realtime)</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del producto"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="Precio"
          value={precio}
          onChangeText={setPrecio}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Cantidad"
          value={cantidad}
          onChangeText={setCantidad}
          keyboardType="numeric"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.btnGuardar} onPress={guardarProducto}>
            <Text style={styles.btnText}>{editId ? "Actualizar" : "Guardar"}</Text>
          </TouchableOpacity>
          {editId && (
            <TouchableOpacity style={styles.btnCancelar} onPress={limpiar}>
              <Text style={styles.btnText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.subtitle}>Productos en tiempo real:</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" />
      ) : productos.length === 0 ? (
        <Text style={styles.empty}>No hay productos aún</Text>
      ) : (
        productos.map((p) => (
          <View key={p.id} style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemNombre}>{p.nombre}</Text>
              <Text>Precio: ₡{p.precio?.toFixed(2)}</Text>
              <Text>Cantidad: {p.cantidad}</Text>
            </View>
            <View style={styles.itemButtons}>
              <TouchableOpacity
                style={styles.btnEditar}
                onPress={() => editar(p.id, p)}
              >
                <Text style={styles.btnSmallText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnEliminar}
                onPress={() => eliminar(p.id)}
              >
                <Text style={styles.btnSmallText}>Borrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <Text style={styles.footer}>
        Abre en otro celular → cambios en tiempo real
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#2c3e50" },
  form: { backgroundColor: "white", padding: 20, borderRadius: 12, elevation: 3, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  buttonRow: { flexDirection: "row", gap: 10 },
  btnGuardar: { flex: 1, backgroundColor: "#27ae60", padding: 15, borderRadius: 8, alignItems: "center" },
  btnCancelar: { flex: 1, backgroundColor: "#95a5a6", padding: 15, borderRadius: 8, alignItems: "center" },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  subtitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10, color: "#2c3e50" },
  item: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
  },
  itemInfo: { flex: 1 },
  itemNombre: { fontWeight: "bold", fontSize: 16 },
  itemButtons: { flexDirection: "row", gap: 10 },
  btnEditar: { backgroundColor: "#f39c12", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnEliminar: { backgroundColor: "#e74c3c", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnSmallText: { color: "white", fontWeight: "bold" },
  empty: { textAlign: "center", color: "#7f8c8d", fontStyle: "italic", marginTop: 20 },
  footer: { textAlign: "center", marginTop: 30, color: "#7f8c8d", fontStyle: "italic" },
});

export default ProductosRealtime;