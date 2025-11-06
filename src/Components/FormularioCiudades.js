import React from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";

const FormularioCiudades = ({ nuevaCiudad, manejoCambio, guardarCiudad, actualizarCiudad, modoEdicion }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        {modoEdicion ? "Actualizar Ciudad" : "Registro de Ciudad"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre de la ciudad"
        value={nuevaCiudad.nombre}
        onChangeText={(nombre) => manejoCambio("nombre", nombre)}
      />
       <TextInput
        style={styles.input}
        placeholder="Población"
        value={nuevaCiudad.poblacion}
        onChangeText={(poblacion) => manejoCambio("poblacion", poblacion)}
        keyboardType="numeric"
      />
      
      <TextInput
        style={styles.input}
        placeholder="País"
        value={nuevaCiudad.pais}
        onChangeText={(pais) => manejoCambio("pais", pais)}
      />
     
      <TextInput
        style={styles.input}
        placeholder="Regin"
        value={nuevaCiudad.region}
        onChangeText={(region) => manejoCambio("region", region)}
      />
      <Button 
        title={modoEdicion ? "Actualizar" : "Guardar"}
        onPress={modoEdicion ? actualizarCiudad : guardarCiudad}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10 },
});

export default FormularioCiudades;


