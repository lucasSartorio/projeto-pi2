import { Text, View, StyleSheet } from "react-native";

const Boxdefault = (props) => {
    return ( 
            <View style={style.allInput}>
                <Text style={style.text}>
                    {props.text}
                </Text>
                <Text style={style.inputText}>
                    {props.input}
                </Text>
            </View>
     );
}

const style = StyleSheet.create({
    allInput: {
        borderWidth: 1,
        borderColor: "red",
        width: '80%',
        textAlign: "center",
        alignItems: "center",
        fontSize: 110,
        marginBottom: 20,
        borderRadius: 20,
    },
    text: {
        fontSize: 20,
    },
    inputText: {
        fontSize: 40,
    }
})

 
export default Boxdefault;