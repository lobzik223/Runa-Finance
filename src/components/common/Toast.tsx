import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage | null;
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onHide }) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const mountedRef = useRef(true);
  const activeToastIdRef = useRef<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Останавливаем нативные анимации, чтобы не было:
      // connectAnimatedNodeToView: Animated node ... does not exist
      try {
        slideAnim.stopAnimation();
        opacityAnim.stopAnimation();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (toast) {
      activeToastIdRef.current = toast.id;

      // Анимация появления (выпадает сверху)
      const inAnim = Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
      inAnim.start();

      // Автоматическое скрытие
      const timer = setTimeout(() => {
        // Если уже размонтировались или toast сменился — ничего не делаем
        if (!mountedRef.current) return;
        if (activeToastIdRef.current !== toast.id) return;

        const outAnim = Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -200,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]);
        outAnim.start(() => {
          if (!mountedRef.current) return;
          // Не скрываем “чужой” toast
          if (activeToastIdRef.current !== toast.id) return;
          onHide();
        });
      }, toast.duration || 3000);

      return () => {
        clearTimeout(timer);
        try {
          slideAnim.stopAnimation();
          opacityAnim.stopAnimation();
        } catch {
          // ignore
        }
      };
    } else {
      // Сброс анимации когда toast скрыт
      activeToastIdRef.current = null;
      slideAnim.setValue(-200);
      opacityAnim.setValue(0);
    }
  }, [toast, slideAnim, opacityAnim, onHide]);

  if (!toast) return null;

  const getToastStyle = () => {
    switch (toast.type) {
      case 'success':
        return { backgroundColor: '#4CAF50', borderColor: '#2E7D32' };
      case 'error':
        return { backgroundColor: '#F44336', borderColor: '#C62828' };
      case 'warning':
        return { backgroundColor: '#FF9800', borderColor: '#E65100' };
      case 'info':
      default:
        return { backgroundColor: '#1D4981', borderColor: '#0D3A6B' };
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 10,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.toast, getToastStyle()]}
        onPress={() => {
          const currentId = toast.id;
          activeToastIdRef.current = currentId;

          const outAnim = Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: -200,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]);
          outAnim.start(() => {
            if (!mountedRef.current) return;
            if (activeToastIdRef.current !== currentId) return;
            onHide();
          });
        }}
      >
        <View style={styles.content}>
          <Text style={styles.icon}>{getIcon()}</Text>
          <Text style={styles.message} numberOfLines={2}>
            {toast.message}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toast: {
    minHeight: 56,
    maxWidth: SCREEN_WIDTH - 32,
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  icon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 12,
    width: 28,
    textAlign: 'center',
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 20,
  },
});

export default Toast;
