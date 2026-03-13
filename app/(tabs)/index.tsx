import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

type ToucheType = {
  symbole: string,
  auClic: (args: string) => void,
  couleur: string,
  petit: boolean
}

function Touche({ symbole, auClic, couleur, petit = false }: ToucheType) {
  return (
    <TouchableOpacity
      style={[styles.touche, { backgroundColor: couleur }, petit ? { height: 30 } : { height: 50 }]}
      onPress={() => auClic(symbole)}
    >
      <Text style={[styles.texteTouche, petit && { fontSize: 14 }]}>{symbole}</Text>
    </TouchableOpacity>
  );
}

const factorielle = (n: number) => {
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
  const [positionCurseur, setPositionCurseur] = useState(1);
  const [historique, setHistorique] = useState<string[]>([]);
  const [indexHist, setIndexHist] = useState(-1);

  const calculerResultat = (valeurActuelle: string, isFinal = false) => {
    try {
      if (!valeurActuelle || valeurActuelle === "0") {
        setResultat("");
        return;
      }
      let expression = valeurActuelle.replace(/π/g, 'Math.PI');
      expression = expression.replace(/((?:\((?:[^()]+|(?:\([^()]*\)))*\)|[\w√!π\.]+))!/g, 'factorielle($1)');
      while (expression.includes('√')) {
        expression = expression.replace(/√(\((?:[^()]+|(?:\([^()]*\)))*\)|[a-zα-ω√!π\d\.]+)/g, 'Math.sqrt($1)');
      }
      expression = expression.replace(/(sn|cos|tn|ln|exp)\s*(\((?:[^()]+|(?:\([^()]*\)))*\)|[\w√!π\.]+)/g, (m, nom, contenu) => {
        if (nom === 'ln') return `Math.log(${contenu})`;
        return `Math.${nom.toLowerCase()}(${contenu})`;
      });
      while (expression.includes('^')) {
        expression = expression.replace(/((?:\((?:[^()]+|(?:\([^()]*\)))*\)|[\w√!π\.]+))\s*\^\s*((?:\((?:[^()]+|(?:\([^()]*\)))*\)|[\w√!π\.]+))/g, "Math.pow($1, $2)");
      }
      if (expression.includes("**") || expression.includes("//")) throw new Error();
      const res = eval(expression);
      const resStr = res.toString();
      setResultat(resStr);
      return resStr;
    } catch (e) {
      if (isFinal) {
        setResultat("ERROR");
        return "ERROR";
      }
      setResultat("");
      return "";
    }
  };

  const gererAppui = (symbole: string) => {
    if (symbole === "f/o") {
      if (estAllumee) {
        setEntree("");
        setResultat("");
        setPositionCurseur(1);
      } else {
        setEntree("0");
        setResultat("0");
        setPositionCurseur(1);
      }
      setEstAllumee(!estAllumee);
      return;
    }
    if (!estAllumee) return;
    switch (symbole) {
      case "C":
        setEntree("0");
        setResultat("");
        setPositionCurseur(1);
        break;
      case "x":
        if (positionCurseur > 0) {
          const nouveau = entree.slice(0, positionCurseur - 1) + entree.slice(positionCurseur);
          const final = nouveau || "0";
          setEntree(final);
          setPositionCurseur(Math.max(0, positionCurseur - 1));
          setResultat(calculerResultat(final));
        }
        break;
      case "⬅️":
        setPositionCurseur(Math.max(0, positionCurseur - 1));
        break;
      case "➡️":
        setPositionCurseur(Math.min(entree.length, positionCurseur + 1));
        break;
      case "⬆️":
        if (historique.length > 0) {
          const newIdx = indexHist === -1 ? historique.length - 1 : Math.max(0, indexHist - 1);
          setIndexHist(newIdx);
          setEntree(historique[newIdx]);
          setPositionCurseur(historique[newIdx].length);
          setResultat(calculerResultat(historique[newIdx]));
        }
        break;
      case "⬇️":
        if (indexHist !== -1) {
          const newIdx = indexHist + 1;
          if (newIdx < historique.length) {
            setIndexHist(newIdx);
            setEntree(historique[newIdx]);
            setPositionCurseur(historique[newIdx].length);
            setResultat(calculerResultat(historique[newIdx]));
          } else {
            setIndexHist(-1);
            setEntree("0");
            setResultat("0");
            setPositionCurseur(1);
          }
        }
        break;
      case "=":
        const finalRes = calculerResultat(entree, true);
        if (finalRes !== "" && finalRes !== "Error") {
          setHistorique(prev => [...prev.slice(-9), entree]);
          setEntree(finalRes);
          setResultat("");
          setPositionCurseur(finalRes.length);
        } else {
          setResultat("ERROR");
        }
        break;
      default:
        let nouveau;
        if (entree === "0") {
          nouveau = symbole;
          setPositionCurseur(symbole.length);
        } else {
          nouveau = entree.slice(0, positionCurseur) + symbole + entree.slice(positionCurseur);
          setPositionCurseur(positionCurseur + symbole.length);
        }
        setEntree(nouveau);
        setResultat(calculerResultat(nouveau));
        break;
    }
  };

  const affichageAvecCurseur = entree.slice(0, positionCurseur) + "|" + entree.slice(positionCurseur);

  return (
    <SafeAreaView style={styles.body}>
      <ScrollView contentContainerStyle={styles.scrollGlobal}>
        <View style={[styles.calculatrice, estPaysage && styles.Paysage]}>
          <View style={[styles.ecran, !estAllumee && { backgroundColor: '#b0b0b0' }, estPaysage && { height: 60, padding: 8, marginBottom: 8 }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              ref={(ref) => ref?.scrollToEnd({ animated: true })}
            >
              <Text style={[styles.texteEntree, estPaysage && { fontSize: 18 }]}>
                {estAllumee ? affichageAvecCurseur : ""}
              </Text>
            </ScrollView>
            <View style={[styles.containerResultat, estPaysage && { paddingTop: 2 }]}>
              <Text style={[styles.texteResultat, estPaysage && { fontSize: 14 }]}>
                {estAllumee ? resultat : ""}
              </Text>
            </View>
          </View>

          <View style={[styles.clavier, estPaysage && { gap: 6 }]}>
            <View style={[styles.ligne, estPaysage && { gap: 6 }]}>
              <Touche symbole="⬆️" auClic={gererAppui} couleur="#111" petit={estPaysage} />
              <Touche symbole="⬅️" auClic={gererAppui} couleur="#111" petit={estPaysage} />
              <Touche symbole="➡️" auClic={gererAppui} couleur="#111" petit={estPaysage} />
              <Touche symbole="⬇️" auClic={gererAppui} couleur="#111" petit={estPaysage} />
            </View>

            <View style={[styles.ligne, estPaysage && { gap: 6 }]}>
              <Touche symbole="C" auClic={gererAppui} couleur="#7c4338" petit={estPaysage} />
              <Touche symbole="x" auClic={gererAppui} couleur="#222" petit={estPaysage} />
              <Touche symbole="f/o" auClic={gererAppui} couleur="#7c4338" petit={estPaysage} />
              {estPaysage && <Touche symbole="sn" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
              {estPaysage && <Touche symbole="cos" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
              <Touche symbole="/" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />
            </View>

            <View style={[styles.ligne, estPaysage && { gap: 6 }]}>
              <Touche symbole="7" auClic={gererAppui} couleur="#111" petit={estPaysage} />
              <Touche symbole="8" auClic={gererAppui} couleur="#111" petit={estPaysage} />
              <Touche symbole="9" auClic={gererAppui} couleur="#111" petit={estPaysage} />
              {estPaysage && <Touche symbole="tn" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
              {estPaysage && <Touche symbole="!" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
              <Touche symbole="*" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />
            </View>

            <View style={[styles.ligne, estPaysage && { gap: 6 }]}>
              <Touche symbole="4" auClic={gererAppui} couleur="#111" petit={estPaysage} />
              <Touche symbole="5" auClic={gererAppui} couleur="#111" petit={estPaysage} />
              <Touche symbole="6" auClic={gererAppui} couleur="#111" petit={estPaysage} />
              {estPaysage && <Touche symbole="ln" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
              {estPaysage && <Touche symbole="exp" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
              <Touche symbole="-" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />
            </View>

            <View style={[styles.ligne, estPaysage && { gap: 6 }]}>
              <Touche symbole="1" auClic={gererAppui} couleur="#111" petit={estPaysage} />
              <Touche symbole="2" auClic={gererAppui} couleur="#111" petit={estPaysage} />
              <Touche symbole="3" auClic={gererAppui} couleur="#111" petit={estPaysage} />
              {estPaysage && <Touche symbole="√" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
              {estPaysage && <Touche symbole="^" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
              <Touche symbole="+" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />
            </View>

            <View style={[styles.ligne, estPaysage && { gap: 6 }]}>
              <Touche symbole="0" auClic={gererAppui} couleur="#111" petit={estPaysage} />
              <Touche symbole="." auClic={gererAppui} couleur="#111" petit={estPaysage} />
              <Touche symbole="=" auClic={gererAppui} couleur="#7c4338" petit={estPaysage} />
              {estPaysage && <Touche symbole="π" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
              {estPaysage && <Touche symbole="(" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
              {estPaysage && <Touche symbole=")" auClic={gererAppui} couleur="#7f8384" petit={estPaysage} />}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollGlobal: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10, // Petit espace en haut et bas
  },
  calculatrice: {
    backgroundColor: '#4c4c5e',
    width: '90%',
    maxWidth: 450,
    padding: 15,
    borderRadius: 25
  },
  Paysage: {
    width: '95%',
    maxWidth: 800,
    padding: 10,
    borderRadius: 15
  },
  ecran: {
    backgroundColor: 'white',
    height: 90,
    borderRadius: 10,
    marginBottom: 12,
    justifyContent: 'space-between',
    padding: 12
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  containerResultat: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 4,
  },
  texteEntree: {
    fontSize: 24,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#222'
  },
  texteResultat: {
    fontSize: 18,
    textAlign: 'right',
    color: '#666'
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
    borderRadius: 8,
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
