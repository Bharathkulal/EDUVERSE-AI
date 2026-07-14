import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  Play, RotateCcw, Save, Trash2, BookOpen, AlertCircle, CheckCircle2, 
  XCircle, ChevronLeft, ChevronRight, HelpCircle, ArrowLeft, Terminal,
  Code2, Check, FileCode, CheckSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock coding tasks database containing 10+ exercises per subject/language
const CODING_TASKS = {
  'Java': [
    {
      id: 'java-t1',
      title: 'Find Sum of All Elements',
      topic: 'Arrays',
      difficulty: 'Easy',
      desc: 'Write a method `sumArray(int[] arr)` that returns the sum of all integers in the array.',
      sampleInput: 'arr = [1, 2, 3, 4]',
      sampleOutput: '10',
      hint: 'Use a simple for loop or enhanced for loop to accumulate values.',
      starterCode: `public class Solution {\n    public int sumArray(int[] arr) {\n        int sum = 0;\n        for (int num : arr) {\n            sum += num;\n        }\n        return sum;\n    }\n}`,
      testCases: [{ input: '[1,2,3,4]', expected: '10' }]
    },
    {
      id: 'java-t2',
      title: 'Find Average of Elements',
      topic: 'Arrays',
      difficulty: 'Easy',
      desc: 'Write a method `avgArray(int[] arr)` that returns the average value as a double.',
      sampleInput: 'arr = [1, 2, 3, 4]',
      sampleOutput: '2.5',
      hint: 'Accumulate the sum first, then divide by the array length casting to double.',
      starterCode: `public class Solution {\n    public double avgArray(int[] arr) {\n        double sum = 0;\n        for (int num : arr) sum += num;\n        return sum / arr.length;\n    }\n}`,
      testCases: [{ input: '[1,2,3,4]', expected: '2.5' }]
    },
    {
      id: 'java-t3',
      title: 'Find Maximum Element',
      topic: 'Arrays',
      difficulty: 'Easy',
      desc: 'Write a method `findMax(int[] arr)` that returns the largest integer in the array.',
      sampleInput: 'arr = [5, 2, 9, 1]',
      sampleOutput: '9',
      hint: 'Initialize max to the first element and update whenever a larger value is found.',
      starterCode: `public class Solution {\n    public int findMax(int[] arr) {\n        int max = arr[0];\n        for (int num : arr) {\n            if (num > max) max = num;\n        }\n        return max;\n    }\n}`,
      testCases: [{ input: '[5,2,9,1]', expected: '9' }]
    },
    {
      id: 'java-t4',
      title: 'Find Minimum Element',
      topic: 'Arrays',
      difficulty: 'Easy',
      desc: 'Write a method `findMin(int[] arr)` that returns the smallest integer in the array.',
      sampleInput: 'arr = [5, 2, 9, 1]',
      sampleOutput: '1',
      hint: 'Initialize min to the first element and update whenever a smaller value is found.',
      starterCode: `public class Solution {\n    public int findMin(int[] arr) {\n        int min = arr[0];\n        for (int num : arr) {\n            if (num < min) min = num;\n        }\n        return min;\n    }\n}`,
      testCases: [{ input: '[5,2,9,1]', expected: '1' }]
    },
    {
      id: 'java-t5',
      title: 'Find Second Largest',
      topic: 'Arrays',
      difficulty: 'Medium',
      desc: 'Write a method `findSecondLargest(int[] arr)` that returns the second largest value in the array.',
      sampleInput: 'arr = [12, 35, 1, 10, 34]',
      sampleOutput: '34',
      hint: 'Track both max and secondMax as you scan the elements.',
      starterCode: `public class Solution {\n    public int findSecondLargest(int[] arr) {\n        int max = Integer.MIN_VALUE, second = Integer.MIN_VALUE;\n        for (int num : arr) {\n            if (num > max) {\n                second = max;\n                max = num;\n            } else if (num > second && num != max) {\n                second = num;\n            }\n        }\n        return second;\n    }\n}`,
      testCases: [{ input: '[12,35,1,10,34]', expected: '34' }]
    },
    {
      id: 'java-t6',
      title: 'Reverse the Array',
      topic: 'Arrays',
      difficulty: 'Medium',
      desc: 'Write a method `reverse(int[] arr)` that returns a new array with elements in reversed order.',
      sampleInput: 'arr = [1, 2, 3]',
      sampleOutput: '[3, 2, 1]',
      hint: 'Iterate from length-1 down to 0, inserting elements into a new array.',
      starterCode: `public class Solution {\n    public int[] reverse(int[] arr) {\n        int[] rev = new int[arr.length];\n        for (int i = 0; i < arr.length; i++) {\n            rev[i] = arr[arr.length - 1 - i];\n        }\n        return rev;\n    }\n}`,
      testCases: [{ input: '[1,2,3]', expected: '[3,2,1]' }]
    },
    {
      id: 'java-t7',
      title: 'Sort the Array',
      topic: 'Arrays',
      difficulty: 'Medium',
      desc: 'Write a method `sort(int[] arr)` that returns a sorted copy of the array.',
      sampleInput: 'arr = [3, 1, 2]',
      sampleOutput: '[1, 2, 3]',
      hint: 'You can use Arrays.sort() after cloning the array.',
      starterCode: `import java.util.Arrays;\npublic class Solution {\n    public int[] sort(int[] arr) {\n        int[] copy = arr.clone();\n        Arrays.sort(copy);\n        return copy;\n    }\n}`,
      testCases: [{ input: '[3,1,2]', expected: '[1,2,3]' }]
    },
    {
      id: 'java-t8',
      title: 'Linear Search',
      topic: 'Arrays',
      difficulty: 'Easy',
      desc: 'Write a method `search(int[] arr, int target)` that returns the 0-based index of target, or -1 if not found.',
      sampleInput: 'arr = [4, 2, 8], target = 2',
      sampleOutput: '1',
      hint: 'Iterate through the array. If arr[i] == target, return index i immediately.',
      starterCode: `public class Solution {\n    public int search(int[] arr, int target) {\n        for (int i = 0; i < arr.length; i++) {\n            if (arr[i] == target) return i;\n        }\n        return -1;\n    }\n}`,
      testCases: [{ input: '[4,2,8], target=2', expected: '1' }]
    },
    {
      id: 'java-t9',
      title: 'Count Even and Odd',
      topic: 'Arrays',
      difficulty: 'Easy',
      desc: 'Write a method `countEvenOdd(int[] arr)` that returns an array where index 0 is even count and index 1 is odd count.',
      sampleInput: 'arr = [1, 2, 3, 4, 5]',
      sampleOutput: '[2, 3]',
      hint: 'Check if num % 2 == 0 to increment even count, else increment odd count.',
      starterCode: `public class Solution {\n    public int[] countEvenOdd(int[] arr) {\n        int evens = 0, odds = 0;\n        for (int num : arr) {\n            if (num % 2 == 0) evens++;\n            else odds++;\n        }\n        return new int[]{evens, odds};\n    }\n}`,
      testCases: [{ input: '[1,2,3,4,5]', expected: '[2,3]' }]
    },
    {
      id: 'java-t10',
      title: 'Count Element Frequency',
      topic: 'Arrays',
      difficulty: 'Medium',
      desc: 'Write a method `frequency(int[] arr, int target)` that returns the number of occurrences of target.',
      sampleInput: 'arr = [1, 2, 2, 3], target = 2',
      sampleOutput: '2',
      hint: 'Iterate and increment a counter variable whenever element matches target.',
      starterCode: `public class Solution {\n    public int frequency(int[] arr, int target) {\n        int count = 0;\n        for (int num : arr) {\n            if (num == target) count++;\n        }\n        return count;\n    }\n}`,
      testCases: [{ input: '[1,2,2,3], target=2', expected: '2' }]
    }
  ],
  'Advanced Java': [
    {
      id: 'adv-t1',
      title: 'Find Max with Streams',
      topic: 'Streams API',
      difficulty: 'Easy',
      desc: 'Write a method `findMax(java.util.List<Integer> list)` using Java Streams to return the maximum value or -1 if empty.',
      sampleInput: 'list = [5, 12, 3]',
      sampleOutput: '12',
      hint: 'Use list.stream().max(Integer::compare) or mapToInt.',
      starterCode: `import java.util.List;\npublic class Solution {\n    public int findMax(List<Integer> list) {\n        return list.stream().mapToInt(Integer::intValue).max().orElse(-1);\n    }\n}`,
      testCases: [{ input: '[5,12,3]', expected: '12' }]
    },
    {
      id: 'adv-t2',
      title: 'Filter Evens with Streams',
      topic: 'Streams API',
      difficulty: 'Easy',
      desc: 'Write a method `filterEvens(java.util.List<Integer> list)` that returns a list of only even numbers.',
      sampleInput: 'list = [1, 2, 3, 4]',
      sampleOutput: '[2, 4]',
      hint: 'Use .filter(n -> n % 2 == 0) and collect using Collectors.toList().',
      starterCode: `import java.util.List;\nimport java.util.stream.Collectors;\npublic class Solution {\n    public List<Integer> filterEvens(List<Integer> list) {\n        return list.stream().filter(n -> n % 2 == 0).collect(Collectors.toList());\n    }\n}`,
      testCases: [{ input: '[1,2,3,4]', expected: '[2,4]' }]
    },
    {
      id: 'adv-t3',
      title: 'Map String to Uppercase',
      topic: 'Lambda Expressions',
      difficulty: 'Easy',
      desc: 'Write a method `toUpper(java.util.List<String> list)` using streams to convert all items to uppercase.',
      sampleInput: 'list = ["a", "b"]',
      sampleOutput: '["A", "B"]',
      hint: 'Use .map(String::toUpperCase) or lambda syntax.',
      starterCode: `import java.util.List;\nimport java.util.stream.Collectors;\npublic class Solution {\n    public List<String> toUpper(List<String> list) {\n        return list.stream().map(String::toUpperCase).collect(Collectors.toList());\n    }\n}`,
      testCases: [{ input: '["a","b"]', expected: '["A","B"]' }]
    },
    {
      id: 'adv-t4',
      title: 'Sort List of Strings',
      topic: 'Collections',
      difficulty: 'Medium',
      desc: 'Write a method `sortStrings(java.util.List<String> list)` that sorts the list alphabetically in-place.',
      sampleInput: 'list = ["orange", "apple"]',
      sampleOutput: '["apple", "orange"]',
      hint: 'Use list.sort(null) or Collections.sort().',
      starterCode: `import java.util.List;\nimport java.util.Collections;\npublic class Solution {\n    public List<String> sortStrings(List<String> list) {\n        Collections.sort(list);\n        return list;\n    }\n}`,
      testCases: [{ input: '["orange","apple"]', expected: '["apple","orange"]' }]
    },
    {
      id: 'adv-t5',
      title: 'Thread Safe Counter',
      topic: 'Concurrency',
      difficulty: 'Medium',
      desc: 'Create a thread-safe increment counter using AtomicInteger.',
      sampleInput: 'increment 3 times',
      sampleOutput: '3',
      hint: 'Use AtomicInteger and call incrementAndGet().',
      starterCode: `import java.util.concurrent.atomic.AtomicInteger;\npublic class Solution {\n    private AtomicInteger counter = new AtomicInteger(0);\n    public int increment() {\n        return counter.incrementAndGet();\n    }\n}`,
      testCases: [{ input: 'increment()', expected: '1' }]
    },
    {
      id: 'adv-t6',
      title: 'Lambda Calculator Add',
      topic: 'Functional Interfaces',
      difficulty: 'Easy',
      desc: 'Implement a binary operator lambda to add two integers.',
      sampleInput: '2, 3',
      sampleOutput: '5',
      hint: 'Use java.util.function.BinaryOperator.',
      starterCode: `import java.util.function.BinaryOperator;\npublic class Solution {\n    public int calculate(int a, int b) {\n        BinaryOperator<Integer> add = (x, y) -> x + y;\n        return add.apply(a, b);\n    }\n}`,
      testCases: [{ input: '2, 3', expected: '5' }]
    },
    {
      id: 'adv-t7',
      title: 'Check Distinct Elements',
      topic: 'Collections',
      difficulty: 'Easy',
      desc: 'Write a method `allUnique(java.util.List<Integer> list)` returning True if all values are distinct.',
      sampleInput: 'list = [1, 2, 2]',
      sampleOutput: 'false',
      hint: 'Convert to a Set and compare sizes.',
      starterCode: `import java.util.List;\nimport java.util.HashSet;\npublic class Solution {\n    public boolean allUnique(List<Integer> list) {\n        return new HashSet<>(list).size() == list.size();\n    }\n}`,
      testCases: [{ input: '[1,2,2]', expected: 'false' }]
    },
    {
      id: 'adv-t8',
      title: 'List to Map Converter',
      topic: 'Collections',
      difficulty: 'Medium',
      desc: 'Convert a list of strings into a Map where keys are strings and values are their lengths.',
      sampleInput: 'list = ["cat"]',
      sampleOutput: '{"cat": 3}',
      hint: 'Use Collectors.toMap().',
      starterCode: `import java.util.List;\nimport java.util.Map;\nimport java.util.stream.Collectors;\npublic class Solution {\n    public Map<String, Integer> convert(List<String> list) {\n        return list.stream().collect(Collectors.toMap(s -> s, String::length));\n    }\n}`,
      testCases: [{ input: '["cat"]', expected: '{"cat":3}' }]
    },
    {
      id: 'adv-t9',
      title: 'Find First Repeating Element',
      topic: 'Collections',
      difficulty: 'Medium',
      desc: 'Find the first element in a list that repeats, or -1 if none.',
      sampleInput: 'list = [1, 2, 2, 1]',
      sampleOutput: '2',
      hint: 'Iterate and use a HashSet to check for seen values.',
      starterCode: `import java.util.List;\nimport java.util.HashSet;\npublic class Solution {\n    public int firstRepeating(List<Integer> list) {\n        HashSet<Integer> seen = new HashSet<>();\n        for (int num : list) {\n            if (seen.contains(num)) return num;\n            seen.add(num);\n        }\n        return -1;\n    }\n}`,
      testCases: [{ input: '[1,2,2,1]', expected: '2' }]
    },
    {
      id: 'adv-t10',
      title: 'Grouping Elements by Length',
      topic: 'Streams API',
      difficulty: 'Hard',
      desc: 'Group a list of strings by their length using Collectors.groupingBy.',
      sampleInput: 'list = ["a", "bb"]',
      sampleOutput: '{1: ["a"], 2: ["bb"]}',
      hint: 'Use Collectors.groupingBy(String::length).',
      starterCode: `import java.util.List;\nimport java.util.Map;\nimport java.util.stream.Collectors;\npublic class Solution {\n    public Map<Integer, List<String>> groupByLen(List<String> list) {\n        return list.stream().collect(Collectors.groupingBy(String::length));\n    }\n}`,
      testCases: [{ input: '["a","bb"]', expected: '{1=["a"], 2=["bb"]}' }]
    }
  ],
  'C': [
    {
      id: 'c-t1',
      title: 'Find String Length',
      topic: 'Strings',
      difficulty: 'Easy',
      desc: 'Write a function `stringLength(char* str)` that returns the length of the null-terminated string.',
      sampleInput: 'str = "hello"',
      sampleOutput: '5',
      hint: 'Count elements until the null terminator \'\\0\' is reached.',
      starterCode: `int stringLength(char* str) {\n    int len = 0;\n    while (str[len] != '\\0') {\n        len++;\n    }\n    return len;\n}`,
      testCases: [{ input: '"hello"', expected: '5' }]
    },
    {
      id: 'c-t2',
      title: 'Reverse a String',
      topic: 'Strings',
      difficulty: 'Medium',
      desc: 'Write a function `reverseString(char* str)` that reverses the string in-place.',
      sampleInput: 'str = "cat"',
      sampleOutput: '"tac"',
      hint: 'Use a two-pointer approach swapping start and end elements.',
      starterCode: `void reverseString(char* str) {\n    int len = 0;\n    while(str[len]) len++;\n    for (int i = 0; i < len / 2; i++) {\n        char temp = str[i];\n        str[i] = str[len - 1 - i];\n        str[len - 1 - i] = temp;\n    }\n}`,
      testCases: [{ input: '"cat"', expected: 'tac' }]
    },
    {
      id: 'c-t3',
      title: 'Check Palindrome',
      topic: 'Strings',
      difficulty: 'Easy',
      desc: 'Write a function `isPalindrome(char* str)` that returns 1 if string is a palindrome, else 0.',
      sampleInput: 'str = "radar"',
      sampleOutput: '1',
      hint: 'Check if characters at start and end indices are equal while moving inward.',
      starterCode: `int isPalindrome(char* str) {\n    int len = 0;\n    while(str[len]) len++;\n    for (int i = 0; i < len/2; i++) {\n        if (str[i] != str[len - 1 - i]) return 0;\n    }\n    return 1;\n}`,
      testCases: [{ input: '"radar"', expected: '1' }]
    },
    {
      id: 'c-t4',
      title: 'Count Vowels & Consonants',
      topic: 'Strings',
      difficulty: 'Easy',
      desc: 'Write a function `countVowels(char* str)` that returns the total count of lowercase vowels.',
      sampleInput: 'str = "education"',
      sampleOutput: '5',
      hint: 'Vowels are a, e, i, o, u. Increment count for matches.',
      starterCode: `int countVowels(char* str) {\n    int count = 0;\n    for (int i = 0; str[i] != '\\0'; i++) {\n        char c = str[i];\n        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') count++;\n    }\n    return count;\n}`,
      testCases: [{ input: '"education"', expected: '5' }]
    },
    {
      id: 'c-t5',
      title: 'Convert to Uppercase',
      topic: 'Strings',
      difficulty: 'Easy',
      desc: 'Write a function `toUpper(char* str)` that converts all lowercase letters to uppercase in-place.',
      sampleInput: 'str = "abc"',
      sampleOutput: '"ABC"',
      hint: 'Subtract 32 from characters in the range \'a\' to \'z\'.',
      starterCode: `void toUpper(char* str) {\n    for (int i = 0; str[i]; i++) {\n        if (str[i] >= 'a' && str[i] <= 'z') {\n            str[i] = str[i] - 32;\n        }\n    }\n}`,
      testCases: [{ input: '"abc"', expected: 'ABC' }]
    },
    {
      id: 'c-t6',
      title: 'Compare Two Strings',
      topic: 'Strings',
      difficulty: 'Easy',
      desc: 'Write a function `compareStrings(char* s1, char* s2)` that returns 0 if strings match, or difference if they don\'t.',
      sampleInput: 's1 = "abc", s2 = "abc"',
      sampleOutput: '0',
      hint: 'Iterate character by character until mismatch or null terminator.',
      starterCode: `int compareStrings(char* s1, char* s2) {\n    int i = 0;\n    while (s1[i] == s2[i]) {\n        if (s1[i] == '\\0') return 0;\n        i++;\n    }\n    return s1[i] - s2[i];\n}`,
      testCases: [{ input: '"abc", "abc"', expected: '0' }]
    },
    {
      id: 'c-t7',
      title: 'Count Word Frequency',
      topic: 'Strings',
      difficulty: 'Medium',
      desc: 'Write a function `countWords(char* str)` that returns the total words separated by single spaces.',
      sampleInput: 'str = "Hello world coding"',
      sampleOutput: '3',
      hint: 'Count the space characters and add 1, handling non-empty criteria.',
      starterCode: `int countWords(char* str) {\n    if (str[0] == '\\0') return 0;\n    int count = 1;\n    for (int i = 0; str[i]; i++) {\n        if (str[i] == ' ') count++;\n    }\n    return count;\n}`,
      testCases: [{ input: '"Hello world coding"', expected: '3' }]
    },
    {
      id: 'c-t8',
      title: 'Remove Spaces',
      topic: 'Strings',
      difficulty: 'Medium',
      desc: 'Write a function `removeSpaces(char* str)` that removes all white spaces in-place.',
      sampleInput: 'str = "a b c"',
      sampleOutput: '"abc"',
      hint: 'Maintain a read and write index pointer to skip spaces.',
      starterCode: `void removeSpaces(char* str) {\n    int count = 0;\n    for (int i = 0; str[i]; i++) {\n        if (str[i] != ' ') {\n            str[count++] = str[i];\n        }\n    }\n    str[count] = '\\0';\n}`,
      testCases: [{ input: '"a b c"', expected: 'abc' }]
    },
    {
      id: 'c-t9',
      title: 'Find Substring Index',
      topic: 'Strings',
      difficulty: 'Medium',
      desc: 'Write a function `findSubstring(char* str, char* sub)` that returns the index of the first occurrence of sub, or -1.',
      sampleInput: 'str = "coding", sub = "in"',
      sampleOutput: '3',
      hint: 'Compare sub-slices of the main string with the substring template.',
      starterCode: `int findSubstring(char* str, char* sub) {\n    for (int i = 0; str[i]; i++) {\n        int j = 0;\n        while (sub[j] && str[i + j] == sub[j]) j++;\n        if (sub[j] == '\\0') return i;\n    }\n    return -1;\n}`,
      testCases: [{ input: '"coding", "in"', expected: '3' }]
    },
    {
      id: 'c-t10',
      title: 'Check Anagram',
      topic: 'Strings',
      difficulty: 'Hard',
      desc: 'Write a function `isAnagram(char* s1, char* s2)` that returns 1 if they are anagrams, else 0.',
      sampleInput: 's1 = "silent", s2 = "listen"',
      sampleOutput: '1',
      hint: 'Count frequencies of each character and ensure count profiles match exactly.',
      starterCode: `int isAnagram(char* s1, char* s2) {\n    int freq[256] = {0};\n    int i = 0;\n    while(s1[i]) freq[(unsigned char)s1[i++]]++;\n    i = 0;\n    while(s2[i]) freq[(unsigned char)s2[i++]]--;\n    for (int j = 0; j < 256; j++) {\n        if (freq[j] != 0) return 0;\n    }\n    return 1;\n}`,
      testCases: [{ input: '"silent", "listen"', expected: '1' }]
    }
  ],
  'C#': [
    {
      id: 'cs-t1',
      title: 'Find Sum of Elements',
      topic: 'Arrays',
      difficulty: 'Easy',
      desc: 'Write a method `Sum(int[] arr)` that returns the sum of array elements.',
      sampleInput: 'arr = [1, 2, 3]',
      sampleOutput: '6',
      hint: 'Use a foreach loop to accumulate the values.',
      starterCode: `public class Solution {\n    public int Sum(int[] arr) {\n        int sum = 0;\n        foreach (int x in arr) sum += x;\n        return sum;\n    }\n}`,
      testCases: [{ input: '[1,2,3]', expected: '6' }]
    },
    {
      id: 'cs-t2',
      title: 'Reverse a String',
      topic: 'Strings',
      difficulty: 'Easy',
      desc: 'Write a method `ReverseString(string str)` that returns the reversed string.',
      sampleInput: 'str = "abc"',
      sampleOutput: '"cba"',
      hint: 'Convert to char array, use Array.Reverse(), and construct a new string.',
      starterCode: `using System;\npublic class Solution {\n    public string ReverseString(string str) {\n        char[] arr = str.ToCharArray();\n        Array.Reverse(arr);\n        return new string(arr);\n    }\n}`,
      testCases: [{ input: '"abc"', expected: 'cba' }]
    },
    {
      id: 'cs-t3',
      title: 'Check Prime C#',
      topic: 'Logic',
      difficulty: 'Medium',
      desc: 'Check if an integer is prime.',
      sampleInput: 'n = 5',
      sampleOutput: 'true',
      hint: 'Check values from 2 to the square root of n.',
      starterCode: `public class Solution {\n    public bool IsPrime(int n) {\n        if (n <= 1) return false;\n        for (int i = 2; i * i <= n; i++) {\n            if (n % i == 0) return false;\n        }\n        return true;\n    }\n}`,
      testCases: [{ input: '5', expected: 'true' }]
    },
    {
      id: 'cs-t4',
      title: 'Find Largest in List',
      topic: 'Collections',
      difficulty: 'Easy',
      desc: 'Write a method `MaxInList(System.Collections.Generic.List<int> list)` that returns the largest element.',
      sampleInput: 'list = [10, 5, 20]',
      sampleOutput: '20',
      hint: 'Initialize max to list[0] and scan.',
      starterCode: `using System.Collections.Generic;\npublic class Solution {\n    public int MaxInList(List<int> list) {\n        int max = list[0];\n        foreach (int x in list) {\n            if (x > max) max = x;\n        }\n        return max;\n    }\n}`,
      testCases: [{ input: '[10,5,20]', expected: '20' }]
    },
    {
      id: 'cs-t5',
      title: 'Check Anagram C#',
      topic: 'Strings',
      difficulty: 'Medium',
      desc: 'Check if two strings are anagrams.',
      sampleInput: 's1 = "abc", s2 = "cab"',
      sampleOutput: 'true',
      hint: 'Convert to char arrays, sort them, and compare.',
      starterCode: `using System;\npublic class Solution {\n    public bool IsAnagram(string s1, string s2) {\n        char[] a1 = s1.ToCharArray();\n        char[] a2 = s2.ToCharArray();\n        Array.Sort(a1);\n        Array.Sort(a2);\n        return new string(a1) == new string(a2);\n    }\n}`,
      testCases: [{ input: '"abc", "cab"', expected: 'true' }]
    },
    {
      id: 'cs-t6',
      title: 'Count Vowels C#',
      topic: 'Strings',
      difficulty: 'Easy',
      desc: 'Count vowels in a string.',
      sampleInput: 'str = "apple"',
      sampleOutput: '2',
      hint: 'Check if characters match a, e, i, o, u.',
      starterCode: `public class Solution {\n    public int CountVowels(string str) {\n        int count = 0;\n        foreach (char c in str.ToLower()) {\n            if ("aeiou".Contains(c)) count++;\n        }\n        return count;\n    }\n}`,
      testCases: [{ input: '"apple"', expected: '2' }]
    },
    {
      id: 'cs-t7',
      title: 'FizzBuzz Logic C#',
      topic: 'Logic',
      difficulty: 'Easy',
      desc: 'Return Fizz, Buzz, FizzBuzz, or string representation of n.',
      sampleInput: 'n = 15',
      sampleOutput: '"FizzBuzz"',
      hint: 'Check modulo 15, 3, and 5.',
      starterCode: `public class Solution {\n    public string FizzBuzz(int n) {\n        if (n % 15 == 0) return "FizzBuzz";\n        if (n % 3 == 0) return "Fizz";\n        if (n % 5 == 0) return "Buzz";\n        return n.ToString();\n    }\n}`,
      testCases: [{ input: '15', expected: 'FizzBuzz' }]
    },
    {
      id: 'cs-t8',
      title: 'Check Palindrome C#',
      topic: 'Strings',
      difficulty: 'Easy',
      desc: 'Check if a string is a palindrome.',
      sampleInput: 'str = "racecar"',
      sampleOutput: 'true',
      hint: 'Compare str[i] with str[len - 1 - i].',
      starterCode: `public class Solution {\n    public bool IsPalindrome(string str) {\n        int len = str.Length;\n        for (int i = 0; i < len / 2; i++) {\n            if (str[i] != str[len - 1 - i]) return false;\n        }\n        return true;\n    }\n}`,
      testCases: [{ input: '"racecar"', expected: 'true' }]
    },
    {
      id: 'cs-t9',
      title: 'Factorial Recursion C#',
      topic: 'Recursion',
      difficulty: 'Easy',
      desc: 'Write recursive factorial.',
      sampleInput: 'n = 5',
      sampleOutput: '120',
      hint: 'Base case n <= 1.',
      starterCode: `public class Solution {\n    public int Factorial(int n) {\n        if (n <= 1) return 1;\n        return n * Factorial(n - 1);\n    }\n}`,
      testCases: [{ input: '5', expected: '120' }]
    },
    {
      id: 'cs-t10',
      title: 'Fibonacci Term C#',
      topic: 'Logic',
      difficulty: 'Medium',
      desc: 'Return the n-th Fibonacci term.',
      sampleInput: 'n = 4',
      sampleOutput: '3',
      hint: 'Use simple loop variables.',
      starterCode: `public class Solution {\n    public int Fibonacci(int n) {\n        int a = 0, b = 1;\n        for (int i = 0; i < n; i++) {\n            int temp = a;\n            a = b;\n            b = temp + b;\n        }\n        return a;\n    }\n}`,
      testCases: [{ input: '4', expected: '3' }]
    }
  ],
  'Python': [
    {
      id: 'py-t1',
      title: 'Sum of Digits',
      topic: 'Basic Math',
      difficulty: 'Easy',
      desc: 'Write a function `sum_digits(n)` that returns the sum of all digits of a positive integer.',
      sampleInput: 'n = 123',
      sampleOutput: '6',
      hint: 'Extract digits using modulo 10 and division, or cast to string and sum characters.',
      starterCode: `def sum_digits(n):\n    return sum(int(d) for d in str(n))`,
      testCases: [{ input: '123', expected: '6' }]
    },
    {
      id: 'py-t2',
      title: 'Reverse a Number',
      topic: 'Basic Math',
      difficulty: 'Easy',
      desc: 'Write a function `reverse_num(n)` that returns the digits reversed as an integer.',
      sampleInput: 'n = 123',
      sampleOutput: '321',
      hint: 'Cast to string, reverse using slice [::-1], then cast back to integer.',
      starterCode: `def reverse_num(n):\n    return int(str(n)[::-1])`,
      testCases: [{ input: '123', expected: '321' }]
    },
    {
      id: 'py-t3',
      title: 'Check Prime Number',
      topic: 'Basic Math',
      difficulty: 'Medium',
      desc: 'Write a function `is_prime(n)` that returns True if n is prime, else False.',
      sampleInput: 'n = 7',
      sampleOutput: 'True',
      hint: 'Check divisibility from 2 up to the square root of n.',
      starterCode: `def is_prime(n):\n    if n <= 1: return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0: return False\n    return True`,
      testCases: [{ input: '7', expected: 'True' }]
    },
    {
      id: 'py-t4',
      title: 'Find Factorial',
      topic: 'Basic Math',
      difficulty: 'Easy',
      desc: 'Write a function `factorial(n)` that returns the factorial of n.',
      sampleInput: 'n = 4',
      sampleOutput: '24',
      hint: 'Use a loop from 1 to n to accumulate product value.',
      starterCode: `def factorial(n):\n    res = 1\n    for i in range(1, n + 1):\n        res *= i\n    return res`,
      testCases: [{ input: '4', expected: '24' }]
    },
    {
      id: 'py-t5',
      title: 'Fibonacci Series Term',
      topic: 'Basic Math',
      difficulty: 'Medium',
      desc: 'Write a function `fibonacci(n)` that returns the n-th Fibonacci number (0-indexed).',
      sampleInput: 'n = 6',
      sampleOutput: '8',
      hint: 'Iterative progression: f(0)=0, f(1)=1, f(2)=1, f(3)=2, f(4)=3, f(5)=5, f(6)=8.',
      starterCode: `def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a`,
      testCases: [{ input: '6', expected: '8' }]
    },
    {
      id: 'py-t6',
      title: 'Even or Odd Check',
      topic: 'Basic Math',
      difficulty: 'Easy',
      desc: 'Write a function `even_odd(n)` that returns "Even" or "Odd".',
      sampleInput: 'n = 4',
      sampleOutput: '"Even"',
      hint: 'Use n % 2 == 0 to determine even state.',
      starterCode: `def even_odd(n):\n    return "Even" if n % 2 == 0 else "Odd"`,
      testCases: [{ input: '4', expected: 'Even' }]
    },
    {
      id: 'py-t7',
      title: 'Leap Year Check',
      topic: 'Basic Math',
      difficulty: 'Easy',
      desc: 'Write a function `is_leap(year)` that returns True if year is leap, else False.',
      sampleInput: 'year = 2000',
      sampleOutput: 'True',
      hint: 'Divisible by 4 and not 100, or divisible by 400.',
      starterCode: `def is_leap(year):\n    return year % 400 == 0 or (year % 4 == 0 and year % 100 != 0)`,
      testCases: [{ input: '2000', expected: 'True' }]
    },
    {
      id: 'py-t8',
      title: 'Armstrong Number Check',
      topic: 'Basic Math',
      difficulty: 'Medium',
      desc: 'Write a function `is_armstrong(n)` that returns True if the sum of each digit raised to power of digit count equals n.',
      sampleInput: 'n = 153',
      sampleOutput: 'True',
      hint: '1^3 + 5^3 + 3^3 = 153.',
      starterCode: `def is_armstrong(n):\n    s = str(n)\n    power = len(s)\n    return sum(int(d)**power for d in s) == n`,
      testCases: [{ input: '153', expected: 'True' }]
    },
    {
      id: 'py-t9',
      title: 'Palindrome Number Check',
      topic: 'Basic Math',
      difficulty: 'Easy',
      desc: 'Write a function `is_palindrome_num(n)` that returns True if n is a palindrome.',
      sampleInput: 'n = 121',
      sampleOutput: 'True',
      hint: 'Cast to string and check if it equals its reverse slice representation.',
      starterCode: `def is_palindrome_num(n):\n    return str(n) == str(n)[::-1]`,
      testCases: [{ input: '121', expected: 'True' }]
    },
    {
      id: 'py-t10',
      title: 'Greatest of Three',
      topic: 'Basic Math',
      difficulty: 'Easy',
      desc: 'Write a function `greatest(a, b, c)` that returns the largest of the three numbers.',
      sampleInput: 'a=5, b=12, c=9',
      sampleOutput: '12',
      hint: 'Utilize python\'s built-in max() function.',
      starterCode: `def greatest(a, b, c):\n    return max(a, b, c)`,
      testCases: [{ input: '5, 12, 9', expected: '12' }]
    }
  ],
  'R': [
    {
      id: 'r-t1',
      title: 'Vector Mean Calculation',
      topic: 'Vectors',
      difficulty: 'Easy',
      desc: 'Write R expression to calculate the mean of vector `v`.',
      sampleInput: 'v = c(1, 2, 3)',
      sampleOutput: '2',
      hint: 'Use the mean() function.',
      starterCode: `calculate_mean <- function(v) {\n  mean(v)\n}`,
      testCases: [{ input: 'c(1,2,3)', expected: '2' }]
    },
    {
      id: 'r-t2',
      title: 'Vector Standard Deviation',
      topic: 'Vectors',
      difficulty: 'Easy',
      desc: 'Calculate standard deviation of vector `v`.',
      sampleInput: 'v = c(1, 2, 3)',
      sampleOutput: '1',
      hint: 'Use the sd() function.',
      starterCode: `calculate_sd <- function(v) {\n  sd(v)\n}`,
      testCases: [{ input: 'c(1,2,3)', expected: '1' }]
    },
    {
      id: 'r-t3',
      title: 'Find Maximum in Vector',
      topic: 'Vectors',
      difficulty: 'Easy',
      desc: 'Find largest element in vector `v`.',
      sampleInput: 'v = c(4, 9, 2)',
      sampleOutput: '9',
      hint: 'Use the max() function.',
      starterCode: `find_max <- function(v) {\n  max(v)\n}`,
      testCases: [{ input: 'c(4,9,2)', expected: '9' }]
    },
    {
      id: 'r-t4',
      title: 'Matrix Transpose',
      topic: 'Matrices',
      difficulty: 'Easy',
      desc: 'Transpose matrix `m`.',
      sampleInput: '2x2 Matrix',
      sampleOutput: 'Transposed Matrix',
      hint: 'Use the t() function.',
      starterCode: `transpose_matrix <- function(m) {\n  t(m)\n}`,
      testCases: [{ input: 'matrix(1:4, 2)', expected: 'transpose' }]
    },
    {
      id: 'r-t5',
      title: 'Filter Data Frame Rows',
      topic: 'Data Frames',
      difficulty: 'Medium',
      desc: 'Filter rows of data frame `df` where column `age` is greater than 20.',
      sampleInput: 'df with age column',
      sampleOutput: 'filtered rows',
      hint: 'Use df[df$age > 20, ] or subset().',
      starterCode: `filter_df <- function(df) {\n  df[df$age > 20, ]\n}`,
      testCases: [{ input: 'df', expected: 'filtered' }]
    },
    {
      id: 'r-t6',
      title: 'Merge Data Frames',
      topic: 'Data Frames',
      difficulty: 'Medium',
      desc: 'Merge data frames `df1` and `df2` by column `id`.',
      sampleInput: 'df1, df2',
      sampleOutput: 'merged df',
      hint: 'Use merge() function.',
      starterCode: `merge_dfs <- function(df1, df2) {\n  merge(df1, df2, by="id")\n}`,
      testCases: [{ input: 'df1, df2', expected: 'merged' }]
    },
    {
      id: 'r-t7',
      title: 'Count NA Missing Values',
      topic: 'Vectors',
      difficulty: 'Easy',
      desc: 'Count number of NA elements in vector `v`.',
      sampleInput: 'v = c(1, NA, 3)',
      sampleOutput: '1',
      hint: 'Use sum(is.na(v)).',
      starterCode: `count_nas <- function(v) {\n  sum(is.na(v))\n}`,
      testCases: [{ input: 'c(1,NA,3)', expected: '1' }]
    },
    {
      id: 'r-t8',
      title: 'Create Sequence Vector',
      topic: 'Vectors',
      difficulty: 'Easy',
      desc: 'Create sequence from 1 to n with interval 1.',
      sampleInput: 'n = 5',
      sampleOutput: '1 2 3 4 5',
      hint: 'Use seq() or 1:n operator.',
      starterCode: `make_seq <- function(n) {\n  1:n\n}`,
      testCases: [{ input: '5', expected: '1:5' }]
    },
    {
      id: 'r-t9',
      title: 'Vector Element Search',
      topic: 'Vectors',
      difficulty: 'Easy',
      desc: 'Check if element `x` exists in vector `v` returning logical.',
      sampleInput: 'x = 3, v = c(1,2,3)',
      sampleOutput: 'TRUE',
      hint: 'Use x %in% v.',
      starterCode: `search_vector <- function(x, v) {\n  x %in% v\n}`,
      testCases: [{ input: '3, c(1,2,3)', expected: 'TRUE' }]
    },
    {
      id: 'r-t10',
      title: 'R Summary Statistics',
      topic: 'Statistics',
      difficulty: 'Medium',
      desc: 'Return summary statistics list of vector `v`.',
      sampleInput: 'v = c(1..10)',
      sampleOutput: 'summary object',
      hint: 'Use summary() function.',
      starterCode: `get_summary <- function(v) {\n  summary(v)\n}`,
      testCases: [{ input: '1:10', expected: 'summary' }]
    }
  ],
  'PHP': [
    {
      id: 'php-t1',
      title: 'Count Array Elements',
      topic: 'Arrays',
      difficulty: 'Easy',
      desc: 'Write PHP code to count elements in array `$arr`.',
      sampleInput: '$arr = [10, 20]',
      sampleOutput: '2',
      hint: 'Use count() function.',
      starterCode: `function countElements($arr) {\n    return count($arr);\n}`,
      testCases: [{ input: '[10, 20]', expected: '2' }]
    },
    {
      id: 'php-t2',
      title: 'Merge PHP Arrays',
      topic: 'Arrays',
      difficulty: 'Easy',
      desc: 'Merge two arrays.',
      sampleInput: '$a1 = [1], $a2 = [2]',
      sampleOutput: '[1, 2]',
      hint: 'Use array_merge() function.',
      starterCode: `function mergeArrays($a1, $a2) {\n    return array_merge($a1, $a2);\n}`,
      testCases: [{ input: '[1], [2]', expected: '[1,2]' }]
    },
    {
      id: 'php-t3',
      title: 'String Word Count',
      topic: 'Strings',
      difficulty: 'Easy',
      desc: 'Count number of words.',
      sampleInput: '$str = "hello world"',
      sampleOutput: '2',
      hint: 'Use str_word_count() function.',
      starterCode: `function getWordCount($str) {\n    return str_word_count($str);\n}`,
      testCases: [{ input: '"hello world"', expected: '2' }]
    },
    {
      id: 'php-t4',
      title: 'Replace Substring',
      topic: 'Strings',
      difficulty: 'Easy',
      desc: 'Replace `$search` with `$replace` in string `$subject`.',
      sampleInput: '"a", "b", "abc"',
      sampleOutput: '"bbc"',
      hint: 'Use str_replace() function.',
      starterCode: `function replaceSub($search, $replace, $subject) {\n    return str_replace($search, $replace, $subject);\n}`,
      testCases: [{ input: '"a", "b", "abc"', expected: 'bbc' }]
    },
    {
      id: 'php-t5',
      title: 'Check Key Exists',
      topic: 'Arrays',
      difficulty: 'Easy',
      desc: 'Check if key exists in associative array.',
      sampleInput: '$key = "name", $arr = ["name" => "php"]',
      sampleOutput: 'true',
      hint: 'Use array_key_exists() function.',
      starterCode: `function checkKey($key, $arr) {\n    return array_key_exists($key, $arr);\n}`,
      testCases: [{ input: '"name", ["name"=>"php"]', expected: 'true' }]
    },
    {
      id: 'php-t6',
      title: 'Filter Even Values',
      topic: 'Arrays',
      difficulty: 'Medium',
      desc: 'Return even elements of the array.',
      sampleInput: '[1, 2, 3, 4]',
      sampleOutput: '[2, 4]',
      hint: 'Use array_filter with an even checker lambda callback.',
      starterCode: `function filterEven($arr) {\n    return array_filter($arr, function($val) { return $val % 2 == 0; });\n}`,
      testCases: [{ input: '[1,2,3,4]', expected: '[2,4]' }]
    },
    {
      id: 'php-t7',
      title: 'Check Prime PHP',
      topic: 'Logic',
      difficulty: 'Medium',
      desc: 'Determine if integer `$n` is prime.',
      sampleInput: '7',
      sampleOutput: 'true',
      hint: 'Iterate from 2 up to the square root of n.',
      starterCode: `function isPrime($n) {\n    if ($n <= 1) return false;\n    for ($i = 2; $i * $i <= $n; $i++) {\n        if ($n % $i == 0) return false;\n    }\n    return true;\n}`,
      testCases: [{ input: '7', expected: 'true' }]
    },
    {
      id: 'php-t8',
      title: 'Sort Associative Array',
      topic: 'Arrays',
      difficulty: 'Medium',
      desc: 'Sort associative array by values.',
      sampleInput: '["z"=>1, "a"=>2]',
      sampleOutput: 'sorted by value',
      hint: 'Use asort() function.',
      starterCode: `function sortAssoc($arr) {\n    asort($arr);\n    return $arr;\n}`,
      testCases: [{ input: '["z"=>1, "a"=>2]', expected: 'sorted' }]
    },
    {
      id: 'php-t9',
      title: 'Find Duplicate Values',
      topic: 'Arrays',
      difficulty: 'Medium',
      desc: 'Extract duplicate values from array.',
      sampleInput: '[1, 2, 2, 3]',
      sampleOutput: '[2]',
      hint: 'Use array_diff_assoc() along with array_unique().',
      starterCode: `function getDuplicates($arr) {\n    return array_unique(array_diff_assoc($arr, array_unique($arr)));\n}`,
      testCases: [{ input: '[1,2,2,3]', expected: '[2]' }]
    },
    {
      id: 'php-t10',
      title: 'Palindrome String PHP',
      topic: 'Strings',
      difficulty: 'Easy',
      desc: 'Check if string is palindrome.',
      sampleInput: '"radar"',
      sampleOutput: 'true',
      hint: 'Compare string with strrev().',
      starterCode: `function isPalindrome($str) {\n    return $str === strrev($str);\n}`,
      testCases: [{ input: '"radar"', expected: 'true' }]
    }
  ]
};

export default function CodingChallenges({ onExit }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLanguage, setSelectedLanguage] = useState('Java');
  const [tasks, setTasks] = useState(CODING_TASKS['Java']);
  
  const taskId = searchParams.get('task');
  const selectedTask = tasks.find(t => t.id === taskId) || null;
  const viewState = selectedTask ? 'workspace' : 'lobby';
  
  const setSelectedTopic = (task) => {
    if (task) {
      setSearchParams({ module: 'coding', task: task.id });
    } else {
      setSearchParams({ module: 'coding' });
    }
  };

  // Editor States
  const [code, setCode] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [consoleStatus, setConsoleStatus] = useState('Ready'); // Ready, Running, Success, Error
  const [testResults, setTestResults] = useState([]); // Array of { input, expected, actual, passed }
  const [completedTasks, setCompletedTasks] = useState({}); // { taskId: true }
  
  useEffect(() => {
    setTasks(CODING_TASKS[selectedLanguage] || []);
    setSelectedTopic(null);
  }, [selectedLanguage]);

  useEffect(() => {
    if (selectedTask) {
      setCode(selectedTask.starterCode);
      setConsoleOutput('');
      setConsoleStatus('Ready');
      setTestResults([]);
    }
  }, [selectedTask]);

  const handleRunCode = () => {
    if (!code.trim()) {
      toast.error('Code editor is empty!');
      return;
    }
    setConsoleStatus('Running');
    setConsoleOutput('Compiling code...\nLinking dependencies...\nRunning unit test cases...\n');
    
    setTimeout(() => {
      // Simple mock compilation review
      const results = selectedTask.testCases.map(tc => {
        return {
          input: tc.input,
          expected: tc.expected,
          actual: tc.expected, 
          passed: true
        };
      });

      setTestResults(results);
      setConsoleStatus('Success');
      setConsoleOutput(prev => prev + '✔ Compilation Successful!\n✔ All test cases passed.\nStatus: 200 OK');
      toast.success('Code executed successfully!');
    }, 1200);
  };

  const handleResetCode = () => {
    if (window.confirm('Reset code to default template? Your unsaved changes will be lost.')) {
      setCode(selectedTask.starterCode);
      toast.success('Editor reset successfully');
    }
  };

  const handleSaveDraft = () => {
    toast.success('Draft saved successfully!');
  };

  const handleMarkComplete = () => {
    setCompletedTasks(prev => ({
      ...prev,
      [selectedTask.id]: true
    }));
    toast.success('Task marked as complete!');
  };

  const handleNextTask = () => {
    const idx = tasks.findIndex(t => t.id === selectedTask.id);
    if (idx < tasks.length - 1) {
      setSelectedTopic(tasks[idx + 1]);
    } else {
      toast.error('This is the last task for the selected language.');
    }
  };

  const handlePrevTask = () => {
    const idx = tasks.findIndex(t => t.id === selectedTask.id);
    if (idx > 0) {
      setSelectedTopic(tasks[idx - 1]);
    } else {
      toast.error('This is the first task for the selected language.');
    }
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (diff === 'Medium') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  };

  return (
    <div className="quiz-arena-container h-full flex flex-col relative overflow-y-auto">
      {/* Background neon glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#ec4899]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#a855f7]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ───── LOBBY / TASK LIST VIEW ───── */}
      {viewState === 'lobby' && (
        <div className="lobby-panel flex-1 flex flex-col justify-start">
          {/* Top Header Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-5 mb-5 mt-2">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="lobby-title font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">Coding Practice</h1>
              </div>
              <p className="text-slate-400 text-xs mt-1">Write, run, and test your code algorithms in real-time.</p>
            </div>

            {/* Language Selection */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Select Language</span>
                <select 
                  value={selectedLanguage} 
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Java">Java</option>
                  <option value="Advanced Java">Advanced Java</option>
                  <option value="C">C Language</option>
                  <option value="C#">C#</option>
                  <option value="Python">Python</option>
                  <option value="R">R Program</option>
                  <option value="PHP">PHP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid Task Explorer */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[420px] pr-2 scrollbar-thin">
            {tasks.map(task => {
              const isCompleted = completedTasks[task.id];
              return (
                <div
                  key={task.id}
                  onClick={() => { setSelectedTopic(task); setViewState('workspace'); }}
                  className="quiz-card-item p-5 rounded-2xl border border-white/5 bg-slate-900/40 hover:border-white/10 hover:bg-slate-900/60 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${getDifficultyColor(task.difficulty)}`}>
                        {task.difficulty}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                          <CheckCircle2 size={12} /> Solved
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-100">{task.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{task.desc}</p>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/5 text-[10px] text-slate-500">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">{task.topic}</span>
                    <span className="text-cyan-400 font-bold">Solve Task →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ───── SPLIT ENVIRONMENT WORKSPACE ───── */}
      {viewState === 'workspace' && selectedTask && (
        <div className="workspace-panel flex-1 flex flex-col justify-between p-2">
          
          {/* Top Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-3 mb-3">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Coding Workspace</span>
                <h2 className="text-sm font-black text-slate-100">{selectedTask.title}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Status Indicator */}
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                consoleStatus === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                consoleStatus === 'Running' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                'bg-slate-900 border border-white/5 text-slate-400'
              }`}>
                {consoleStatus}
              </span>

              <button 
                onClick={handleRunCode}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-md shadow-cyan-600/15"
              >
                <Play size={12} fill="white" /> Run Code
              </button>

              <button 
                onClick={handleResetCode}
                className="p-1.5 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-slate-400 hover:text-slate-200 cursor-pointer"
                title="Reset Code"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Three Panel Grid Workspace */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-0">
            
            {/* Left: Problem Statement & Hints (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-3 min-h-0">
              <div className="quiz-detail-panel flex-1 p-4 rounded-2xl border border-white/5 bg-slate-900/20 flex flex-col justify-between overflow-y-auto scrollbar-thin">
                <div className="space-y-4">
                  <div>
                    <span className="bg-slate-800 text-slate-400 text-[9px] font-bold px-2 py-0.5 rounded-md border border-white/5">
                      {selectedTask.topic}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-100 mt-2">Problem Statement</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{selectedTask.desc}</p>
                  </div>

                  <div>
                    <h4 className="text-[10px] text-slate-500 uppercase font-black">Sample Case</h4>
                    <pre className="p-3 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] text-slate-400 font-mono mt-1 overflow-x-auto">
                      <code>Input: {selectedTask.sampleInput}<br />Output: {selectedTask.sampleOutput}</code>
                    </pre>
                  </div>

                  <div className="p-3.5 rounded-xl border border-cyan-500/10 bg-cyan-500/5 text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-cyan-400 font-extrabold block mb-1">Teacher's Hint:</strong>
                    {selectedTask.hint}
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Main Code Editor (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-3 min-h-0">
              <div className="flex-1 rounded-2xl border border-white/5 bg-slate-955/90 overflow-hidden flex flex-col justify-between font-mono relative">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-slate-900/40 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1.5"><FileCode size={12} /> Solution.{
                    selectedLanguage === 'Python' ? 'py' : 
                    selectedLanguage === 'C' ? 'c' : 
                    selectedLanguage === 'C#' ? 'cs' : 
                    selectedLanguage === 'PHP' ? 'php' : 
                    selectedLanguage === 'R' ? 'R' : 'java'
                  }</span>
                  <span>Tab Indentation Supported</span>
                </div>
                
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 w-full p-4 bg-transparent text-emerald-400 text-xs focus:outline-none resize-none overflow-y-auto leading-relaxed font-mono"
                  style={{ tabSize: 4 }}
                />
              </div>
            </div>

            {/* Right: Output Console & Test Cases (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-3 min-h-0">
              {/* Output log */}
              <div className="flex-1 rounded-2xl border border-white/5 bg-slate-900/30 p-4 flex flex-col justify-between min-h-[180px]">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider flex items-center gap-1"><Terminal size={12} /> Output Console</span>
                  <pre className="mt-2 text-[10px] text-slate-400 leading-relaxed font-mono whitespace-pre-wrap overflow-y-auto max-h-[140px]">
                    {consoleOutput || 'Click "Run Code" to view output execution details.'}
                  </pre>
                </div>

                {testResults.length > 0 && (
                  <div className="border-t border-white/5 pt-3 mt-3 space-y-2">
                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block">Test Results</span>
                    <div className="space-y-1.5">
                      {testResults.map((tr, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[10px] p-1.5 rounded-lg bg-slate-950/60 border border-white/5">
                          <span className="text-slate-400 font-mono">Case {idx + 1}</span>
                          <span className={`font-bold flex items-center gap-0.5 ${tr.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {tr.passed ? <Check size={12} /> : <XCircle size={12} />} Passed
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Bottom Action Area */}
          <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevTask}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-xs font-bold text-slate-400 flex items-center gap-0.5 cursor-pointer"
              >
                <ChevronLeft size={14} /> Prev Task
              </button>
              <button 
                onClick={handleNextTask}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-xs font-bold text-slate-400 flex items-center gap-0.5 cursor-pointer"
              >
                Next Task <ChevronRight size={14} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleSaveDraft}
                className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-xs font-bold text-slate-400 cursor-pointer"
              >
                Save Draft
              </button>
              <button 
                onClick={handleMarkComplete}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/15 cursor-pointer"
              >
                <CheckSquare size={12} className="inline mr-1" /> Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
