import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';



export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <div style={styles.container}>
        <div >This screen does not exist.</div>
        <Link href="/" style={styles.link}>
          <div >Go to home screen!</div>
        </Link>
      </div>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
