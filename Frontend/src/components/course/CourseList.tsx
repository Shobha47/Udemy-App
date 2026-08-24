import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Course } from '../../types';

interface CourseCardProps {
  course: Course;
  onPress: (id: string) => void;
}

export function CourseList({ course, onPress }: CourseCardProps) {

  const fallbackImage = 'https://images.unsplash.com/photo-1516116211223-5c359a36298a?auto=format&fit=crop&w=600&q=80';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(course.id)}
      activeOpacity={0.8}
    >
        
      <Image
       source={{ uri: course.image || fallbackImage }}
       style={styles.image}
       resizeMode="cover"
      />

      <View style={styles.content}>
        <Text
          style={styles.title}
          numberOfLines={2}
        >
          {course.title}
        </Text>

        <Text style={styles.instructor}>
          {course.instructor?.name}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.rating}>
            ★ {course.rating || 0}
          </Text>

          <Text style={styles.students}>
            {course.studentCount || 0} students
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.level}>
            {course.level}
          </Text>

          <Text style={styles.price}>
            ₹{course.price}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
  },

  image: {
    width: 110,
    height: 80,
    borderRadius: 8,
  },

  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  instructor: {
    fontSize: 11,
    color: '#6B7280',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rating: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 12,
  },

  students: {
    fontSize: 11,
    color: '#6B7280',
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  level: {
    fontSize: 11,
    color: '#4B5563',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
});