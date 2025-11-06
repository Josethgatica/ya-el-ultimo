import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const ListaProductos = ({ productos }) => {
  const renderHeader = () => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.header]}>Nombre</Text>
      <Text style={[styles.cell, styles.header]}>Precio</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.nombre}</Text>
      <Text style={styles.cell}>${item.precio}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de Productos</Text>
      {renderHeader()}
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 8,
  },
  cell: {
    flex: 1,
    fontSize: 16,
    textAlign: "center",
  },
  header: {
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default ListaProductos;