import { StyleSheet } from "react-native";
import { Colors } from "./Colors";

export const common = {
    safeArea: {
        flex: 1
    },
    container: {
        paddingHorizontal: 10
    },

    wrapper: {
      backgroundColor: Colors.White, 
      padding: 10, 
      borderRadius: 10
    },
    
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    
    divider: {
      height:1,
      marginVertical: 10,
      backgroundColor: Colors.LighterGrey, 
    },
    
    defaultTitle: 'outfit-medium',
    title: {
        fontFamily: 'outfit-medium',
        fontSize:18,
    },
    
    subTitle: {
        fontFamily: 'outfit-medium',
        fontSize: 16
    },

    defaultHeading: 'nunito-bold',
    
    defaultText: { 
      fontFamily: 'nunito-medium',
    },
    text: {
        fontFamily: 'nunito-medium',
        color: Colors.LightGrey
    }
}

export const header = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10
    },
    title: {
        flexDirection: 'row', 
        gap: 5
    }
})

export const input = StyleSheet.create({ 
  label: {
    fontFamily: 'nunito-medium',
    alignSelf: 'flex-start',
    fontSize: 16,
    paddingHorizontal:10,
    paddingTop:10,
  },
  box: {
    fontFamily: 'nunito-medium',
    height: 40,
    margin: 10,
    borderWidth: 1,
    borderColor: Colors.Secondary,
    borderRadius: 5,
    padding: 10,
  },
})

export const button = StyleSheet.create({ 
  container: {
    marginVertical: 20,
    height: 50,
    width: "100%",
    borderRadius: 10,
    backgroundColor: Colors.Primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontFamily: 'nunito-medium',
    color: Colors.Secondary,
    fontSize: 18,
    marginLeft: 10
  },
})

export const dropdown = StyleSheet.create({
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: 16,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export const size = StyleSheet.create({
    W100: {
        width: '100%'
    },
    PB5: {
      paddingBottom: 5
    },
    PB50: {
      paddingBottom: 50
    },
    MV10: {
      marginVertical: 10
    },
    MT10: {
      marginTop: 10
    },
    MB10: {
      marginBottom: 10
    }
})
