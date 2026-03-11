
import React, { useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet, SafeAreaView, useWindowDimensions } from "react-native";


function Touche({ symbole, auClic, couleur, petit = false }) {
  return (
    <TouchableOpacity 
      style={[styles.touche, { backgroundColor: couleur }, petit && { height: 40 }]} 
      onPress={() => auClic(symbole)}
    >
      <Text style={[styles.texteTouche, petit && { fontSize: 12 }]}>{symbole}</Text>
    </TouchableOpacity>
  );
}

const factorielle = (n) => {
  if (n < 0) return NaN;
  if (n == 0 || n == 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
};

export default function Index() {
  const { width, height } = useWindowDimensions();
  const estPaysage = width > height;
  const [estAllumee, setEstAllumee] = useState(false);
  const [entree, setEntree] = useState("");
  const [resultat, setResultat] = useState("");
  const calculerResultat = (valeurActuelle, isFinal = false) => {
    try {
      if (!valeurActuelle) {
        setResultat("");
        return;
      }

      let expression = valeurActuelle.replace(/π/g, Math.PI);
      expression = expression.replace(/((?:\((?:[^()]+|(?:\([^()]*\)))*\)|[\w√!π\.]+))!/g, 'factorielle($1)');
      while (expression.includes('√')) {
        expression = expression.replace(/√(\((?:[^()]+|(?:\([^()]*\)))*\)|[a-zα-ω√!π\d\.]+)/g, 'Math.sqrt($1)');
      }
      expression = expression.replace(/(sin|cos|tan|ln|exp)\s*(\((?:[^()]+|(?:\([^()]*\)))*\)|[\w√!π\.]+)/g, (m, nom, contenu) => {
        if (nom === 'ln') return `Math.log(${contenu})`;
        return `Math.${nom.toLowerCase()}(${contenu})`;
      });
      while (expression.includes('^')) {
        expression = expression.replace(/((?:\((?:[^()]+|(?:\([^()]*\)))*\)|[\w√!π\.]+))\s*\^\s*((?:\((?:[^()]+|(?:\([^()]*\)))*\)|[\w√!π\.]+))/g, "Math.pow($1, $2)");
      }
      if (expression.includes("**") || expression.includes("//")) throw new Error();
      const res = eval(expression);
      setResultat(res.toString());
    } catch (e) {
      setResultat(isFinal ? "ERROR" : "");
    }
  };
  const gererAppui = (symbole) => {
    if (symbole === "On / 0ff") {
      if (estAllumee) {
        setEntree("");
        setResultat("");
      } else {
        setEntree("0");
        setResultat("0");
      }
      setEstAllumee(!estAllumee);
      return;
    }

    if (!estAllumee) return;

    if (symbole === "C") {
      setEntree("0");
      setResultat("0");
    } 
    else if (symbole === "x") { 
      const nouvelleEntree = entree.length > 1 ? entree.slice(0, -1) : "0";
      setEntree(nouvelleEntree);
      calculerResultat(nouvelleEntree);
    } 
    else if (symbole === "=") {
      calculerResultat(entree, true);
    } 
    else {
      let nouvelleValeur = entree === "0" ? symbole : entree + symbole;
      setEntree(nouvelleValeur);
      calculerResultat(nouvelleValeur);
    }
  };

  return (
    <SafeAreaView style={styles.body}>
      <View style={[styles.calculatrice, estPaysage && styles.Paysage]}>
        <View style={[styles.ecran, estPaysage && { height: 60 }, !estAllumee && {backgroundColor: '#ccc'}]}>
          <Text style={[styles.texteEntree, estPaysage && { fontSize: 25 }]}>{estAllumee ? entree : ""}</Text>
          <Text style={[styles.texteResultat, estPaysage && { fontSize: 20 }]}>{estAllumee ? resultat : ""}</Text>
        </View>
        <View style={styles.clavier}>
           <View style={styles.ligne}>
            <Touche symbole="C" auClic={gererAppui} couleur="#7c4338" petit={estPaysage} />
            <Touche symbole="x" auClic={gererAppui} couleur="#222" petit={estPaysage} />
            <Touche symbole="O / f" auClic={gererAppui} couleur="#7c4338" petit={estPaysage} />
            {estPaysage && <Touche symbole="sin" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
            {estPaysage && <Touche symbole="cos" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
            <Touche symbole="/" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />
          </View>

          <View style={styles.ligne}>
            <Touche symbole="7" auClic={gererAppui} couleur="#111" petit={estPaysage} />
            <Touche symbole="8" auClic={gererAppui} couleur="#111" petit={estPaysage} />
            <Touche symbole="9" auClic={gererAppui} couleur="#111" petit={estPaysage} />
            {estPaysage && <Touche symbole="tan" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
            {estPaysage && <Touche symbole="!" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
            <Touche symbole="*" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />
          </View>

          <View style={styles.ligne}>
            <Touche symbole="4" auClic={gererAppui} couleur="#111" petit={estPaysage} />
            <Touche symbole="5" auClic={gererAppui} couleur="#111" petit={estPaysage} />
            <Touche symbole="6" auClic={gererAppui} couleur="#111" petit={estPaysage} />
            {estPaysage && <Touche symbole="ln" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
            {estPaysage && <Touche symbole="exp" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
            <Touche symbole="-" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />
          </View>

          <View style={styles.ligne}>
            <Touche symbole="1" auClic={gererAppui} couleur="#111" petit={estPaysage} />
            <Touche symbole="2" auClic={gererAppui} couleur="#111" petit={estPaysage} />
            <Touche symbole="3" auClic={gererAppui} couleur="#111" petit={estPaysage} />
            {estPaysage && <Touche symbole="√" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
            {estPaysage && <Touche symbole="^" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
            <Touche symbole="+" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />
          </View>

          <View style={styles.ligne}>
            <Touche symbole="0" auClic={gererAppui} couleur="#111" petit={estPaysage} />
            <Touche symbole="." auClic={gererAppui} couleur="#111" petit={estPaysage} />
            <Touche symbole="=" auClic={gererAppui} couleur="#7c4338" petit={estPaysage} />
            {estPaysage && <Touche symbole="π" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
            {estPaysage && <Touche symbole="(" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
            {estPaysage && <Touche symbole=")" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1, 
    backgroundColor: '#f0f0f0',
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  calculatrice: {
    backgroundColor: '#4c4c5e', 
    width: '90%', 
    padding: 15, 
    borderRadius: 30 
  },

  Paysage: { 
    width: '95%' 
  },


  ecran: { 
    backgroundColor: 'white', 
    height: 100, 
    borderRadius: 10, 
    marginBottom: 15, 
    justifyContent: 'center', 
    paddingHorizontal: 15 
  },
  
  texteResultat: { 
    fontSize: 20, 
    textAlign: 'right', 
    color: '#666' 
  },

  texteEntree: { 
    fontSize: 35, 
    textAlign: 'right', 
    fontWeight: 'bold' 
  },
  
  clavier: { 
    gap: 8 
  },

  ligne: { 
    flexDirection: 'row', 
    gap: 8 
  },

  touche: { 
    flex: 1, 
    height: 60, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  texteTouche: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
});














// import { Image } from 'expo-image';
// import { Platform, StyleSheet } from 'react-native';

// import { HelloWave } from '@/components/hello-wave';
// import ParallaxScrollView from '@/components/parallax-scroll-view';
// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';
// import { Link } from 'expo-router';

// export default function HomeScreen() {
//   return (
//     <ParallaxScrollView
//       headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
//       headerImage={
//         <Image
//           source={require('@/assets/images/partial-react-logo.png')}
//           style={styles.reactLogo}
//         />
//       }>
//       <ThemedView style={styles.titleContainer}>
//         <ThemedText type="title">Welcome!</ThemedText>
//         <HelloWave />
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 1: Try it</ThemedText>
//         <ThemedText>
//           Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
//           Press{' '}
//           <ThemedText type="defaultSemiBold">
//             {Platform.select({
//               ios: 'cmd + d',
//               android: 'cmd + m',
//               web: 'F12',
//             })}
//           </ThemedText>{' '}
//           to open developer tools.
//         </ThemedText>
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <Link href="/modal">
//           <Link.Trigger>
//             <ThemedText type="subtitle">Step 2: Explore</ThemedText>
//           </Link.Trigger>
//           <Link.Preview />
//           <Link.Menu>
//             <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
//             <Link.MenuAction
//               title="Share"
//               icon="square.and.arrow.up"
//               onPress={() => alert('Share pressed')}
//             />
//             <Link.Menu title="More" icon="ellipsis">
//               <Link.MenuAction
//                 title="Delete"
//                 icon="trash"
//                 destructive
//                 onPress={() => alert('Delete pressed')}
//               />
//             </Link.Menu>
//           </Link.Menu>
//         </Link>

//         <ThemedText>
//           {`Tap the Explore tab to learn more about what's included in this starter app.`}
//         </ThemedText>
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
//         <ThemedText>
//           {`When you're ready, run `}
//           <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
//           <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
//           <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
//           <ThemedText type="defaultSemiBold">app-example</ThemedText>.
//         </ThemedText>
//       </ThemedView>
//     </ParallaxScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   stepContainer: {
//     gap: 8,
//     marginBottom: 8,
//   },
//   reactLogo: {
//     height: 178,
//     width: 290,
//     bottom: 0,
//     left: 0,
//     position: 'absolute',
//   },
// });
