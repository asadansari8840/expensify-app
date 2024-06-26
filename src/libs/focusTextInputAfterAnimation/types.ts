import type {TextInput} from 'react-native';

type FocusTextInputAfterAnimation = (inputRef: TextInput | HTMLElement | undefined, animationLength: number) => void;

export default FocusTextInputAfterAnimation;
