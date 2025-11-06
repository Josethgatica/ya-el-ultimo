import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import BotonEliminarCiudad from "./BotonEliminarCiudad.js";

const TablaCiudades = ({ ciudades, eliminarCiudad, editarCiudad }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Tabla de Ciudades</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalContent}>
        <View style={styles.tabla}>
          <View style={[styles.fila, styles.encabezado]}>
            <Text style={[styles.celda, styles.textoEncabezado]}>Nombre</Text>
            <Text style={[styles.celda, styles.textoEncabezado]}>País</Text>
            <Text style={[styles.celda, styles.textoEncabezado]}>Población</Text>
            <Text style={[styles.celda, styles.textoEncabezado]}>Region</Text>
            <Text style={[styles.celda, styles.textoEncabezado]}>Acciones</Text>
          </View>

          <ScrollView nestedScrollEnabled>
            {ciudades.map((item) => (
              <View key={item.id} style={styles.fila}>
                <Text style={styles.celda}>{item.nombre}</Text>
                <Text style={styles.celda}>{item.pais}</Text>
                <Text style={styles.celda}>{item.poblacion}</Text>
                <Text style={styles.celda}>{item.region}</Text>
                <View style={styles.celdaAcciones}>
                  <TouchableOpacity
                    style={styles.botonActualizar}
                    onPress={() => editarCiudad(item)}
                  >
                    <Text>✏️</Text>
                  </TouchableOpacity>
                  <BotonEliminarCiudad id={item.id} eliminarCiudad={eliminarCiudad} />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignSelf: "stretch"
  },
  horizontalContent: {
    flexGrow: 1
  },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  fila: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 6,
    alignItems: "center",
  },
  encabezado: {
    backgroundColor: "#f0f0f0",
  },
  tabla: {
    alignSelf: "stretch",
    minWidth: 700
  },
  celda: {
    flex: 1,
    fontSize: 16,
    textAlign: "center",
  },
  celdaAcciones: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  textoEncabezado: {
    fontWeight: "bold",
    fontSize: 17,
    textAlign: "center",
  },
  botonActualizar: {
    padding: 4,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "#f3f3f7",
  }
});

export default TablaCiudades;


