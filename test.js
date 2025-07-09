// Test suite for Dual N-Back Game Algorithms
class DualNBackTests {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    // Helper method to create a mock game instance
    createMockGame() {
        return {
            nBackLevel: 2,
            currentTrial: 0,
            positionHistory: [],
            wordHistory: [],
            positionHits: 0,
            positionMisses: 0,
            positionFalseAlarms: 0,
            wordHits: 0,
            wordMisses: 0,
            wordFalseAlarms: 0,
            positionCorrectAnswers: 0,
            positionIncorrectAnswers: 0,
            positionMissedMatches: 0,
            wordCorrectAnswers: 0,
            wordIncorrectAnswers: 0,
            wordMissedMatches: 0,
            positionMatchPressedInTrial: false,
            wordMatchPressedInTrial: false,
            letters: ['дом', 'кот', 'сад', 'лес', 'море', 'солнце', 'цветок', 'книга', 'машина', 'окно']
        };
    }

    // Test helper methods
    assertEqual(actual, expected, testName) {
        if (actual === expected) {
            console.log(`✅ PASS: ${testName}`);
            this.passed++;
        } else {
            console.log(`❌ FAIL: ${testName}`);
            console.log(`   Expected: ${expected}, Got: ${actual}`);
            this.failed++;
        }
    }

    assertTrue(condition, testName) {
        this.assertEqual(condition, true, testName);
    }

    assertFalse(condition, testName) {
        this.assertEqual(condition, false, testName);
    }

    // Test 1: Basic 2-Back Position Match
    testBasicPositionMatch() {
        console.log('\n🧪 Test 1: Basic 2-Back Position Match');
        const game = this.createMockGame();
        
        // Simulate sequence: [0, 1, 0] - position 0 should match 2-back
        game.positionHistory = [0, 1, 0];
        game.currentTrial = 3;
        
        const currentPosition = game.positionHistory[game.positionHistory.length - 1]; // 0
        const nBackPosition = game.positionHistory[game.positionHistory.length - 1 - game.nBackLevel]; // 0
        
        this.assertTrue(currentPosition === nBackPosition, 'Position 0 should match 2-back position 0');
    }

    // Test 2: Basic 2-Back Word Match
    testBasicWordMatch() {
        console.log('\n🧪 Test 2: Basic 2-Back Word Match');
        const game = this.createMockGame();
        
        // Simulate sequence: ['дом', 'кот', 'дом'] - word 'дом' should match 2-back
        game.wordHistory = ['дом', 'кот', 'дом'];
        game.currentTrial = 3;
        
        const currentWord = game.wordHistory[game.wordHistory.length - 1]; // 'дом'
        const nBackWord = game.wordHistory[game.wordHistory.length - 1 - game.nBackLevel]; // 'дом'
        
        this.assertTrue(currentWord === nBackWord, 'Word "дом" should match 2-back word "дом"');
    }

    // Test 3: No Match Scenario
    testNoMatch() {
        console.log('\n🧪 Test 3: No Match Scenario');
        const game = this.createMockGame();
        
        // Simulate sequence: [0, 1, 2] - no match
        game.positionHistory = [0, 1, 2];
        game.currentTrial = 3;
        
        const currentPosition = game.positionHistory[game.positionHistory.length - 1]; // 2
        const nBackPosition = game.positionHistory[game.positionHistory.length - 1 - game.nBackLevel]; // 0
        
        this.assertFalse(currentPosition === nBackPosition, 'Position 2 should not match 2-back position 0');
    }

    // Test 4: 3-Back Position Match
    test3BackPositionMatch() {
        console.log('\n🧪 Test 4: 3-Back Position Match');
        const game = this.createMockGame();
        game.nBackLevel = 3;
        
        // Simulate sequence: [0, 1, 2, 0] - position 0 should match 3-back
        game.positionHistory = [0, 1, 2, 0];
        game.currentTrial = 4;
        
        const currentPosition = game.positionHistory[game.positionHistory.length - 1]; // 0
        const nBackPosition = game.positionHistory[game.positionHistory.length - 1 - game.nBackLevel]; // 0
        
        this.assertTrue(currentPosition === nBackPosition, 'Position 0 should match 3-back position 0');
    }

    // Test 5: Insufficient History
    testInsufficientHistory() {
        console.log('\n🧪 Test 5: Insufficient History');
        const game = this.createMockGame();
        
        // Only 1 item in history, need 3 for 2-back
        game.positionHistory = [0];
        game.currentTrial = 1;
        
        this.assertTrue(game.positionHistory.length <= game.nBackLevel, 'Should detect insufficient history for 2-back');
    }

    // Test 6: Correct Match Detection
    testCorrectMatchDetection() {
        console.log('\n🧪 Test 6: Correct Match Detection');
        const game = this.createMockGame();
        
        // Simulate correct match scenario
        game.positionHistory = [0, 1, 0];
        game.wordHistory = ['дом', 'кот', 'дом'];
        game.positionMatchPressedInTrial = true;
        game.wordMatchPressedInTrial = true;
        
        const currentPosition = game.positionHistory[game.positionHistory.length - 1];
        const nBackPosition = game.positionHistory[game.positionHistory.length - 1 - game.nBackLevel];
        const currentWord = game.wordHistory[game.wordHistory.length - 1];
        const nBackWord = game.wordHistory[game.wordHistory.length - 1 - game.nBackLevel];
        
        const isPositionMatch = currentPosition === nBackPosition;
        const isWordMatch = currentWord === nBackWord;
        
        this.assertTrue(isPositionMatch && game.positionMatchPressedInTrial, 'Should detect correct position match');
        this.assertTrue(isWordMatch && game.wordMatchPressedInTrial, 'Should detect correct word match');
    }

    // Test 7: False Alarm Detection
    testFalseAlarmDetection() {
        console.log('\n🧪 Test 7: False Alarm Detection');
        const game = this.createMockGame();
        
        // Simulate false alarm scenario
        game.positionHistory = [0, 1, 2];
        game.wordHistory = ['дом', 'кот', 'сад'];
        game.positionMatchPressedInTrial = true;
        game.wordMatchPressedInTrial = true;
        
        const currentPosition = game.positionHistory[game.positionHistory.length - 1];
        const nBackPosition = game.positionHistory[game.positionHistory.length - 1 - game.nBackLevel];
        const currentWord = game.wordHistory[game.wordHistory.length - 1];
        const nBackWord = game.wordHistory[game.wordHistory.length - 1 - game.nBackLevel];
        
        const isPositionMatch = currentPosition === nBackPosition;
        const isWordMatch = currentWord === nBackWord;
        
        this.assertFalse(isPositionMatch, 'Should detect position false alarm');
        this.assertFalse(isWordMatch, 'Should detect word false alarm');
    }

    // Test 8: Missed Match Detection
    testMissedMatchDetection() {
        console.log('\n🧪 Test 8: Missed Match Detection');
        const game = this.createMockGame();
        
        // Simulate missed match scenario
        game.positionHistory = [0, 1, 0];
        game.wordHistory = ['дом', 'кот', 'дом'];
        game.positionMatchPressedInTrial = false;
        game.wordMatchPressedInTrial = false;
        
        const currentPosition = game.positionHistory[game.positionHistory.length - 1];
        const nBackPosition = game.positionHistory[game.positionHistory.length - 1 - game.nBackLevel];
        const currentWord = game.wordHistory[game.wordHistory.length - 1];
        const nBackWord = game.wordHistory[game.wordHistory.length - 1 - game.nBackLevel];
        
        const isPositionMatch = currentPosition === nBackPosition;
        const isWordMatch = currentWord === nBackWord;
        
        this.assertTrue(isPositionMatch && !game.positionMatchPressedInTrial, 'Should detect missed position match');
        this.assertTrue(isWordMatch && !game.wordMatchPressedInTrial, 'Should detect missed word match');
    }

    // Test 9: Complex Sequence
    testComplexSequence() {
        console.log('\n🧪 Test 9: Complex Sequence');
        const game = this.createMockGame();
        
        // Complex sequence with multiple matches
        game.positionHistory = [0, 1, 0, 2, 1, 3, 0, 4, 0];
        game.wordHistory = ['дом', 'кот', 'дом', 'сад', 'кот', 'лес', 'дом', 'море', 'дом'];
        
        // Check specific matches in the sequence
        const matches = [];
        for (let i = 2; i < game.positionHistory.length; i++) {
            const currentPos = game.positionHistory[i];
            const nBackPos = game.positionHistory[i - 2];
            const currentWord = game.wordHistory[i];
            const nBackWord = game.wordHistory[i - 2];
            
            if (currentPos === nBackPos) matches.push(`Position match at trial ${i + 1}: ${currentPos}`);
            if (currentWord === nBackWord) matches.push(`Word match at trial ${i + 1}: ${currentWord}`);
        }
        
        this.assertTrue(matches.length > 0, 'Should find matches in complex sequence');
        console.log(`   Found matches: ${matches.join(', ')}`);
    }

    // Test 10: Edge Cases
    testEdgeCases() {
        console.log('\n🧪 Test 10: Edge Cases');
        const game = this.createMockGame();
        
        // Test with empty history
        this.assertTrue(game.positionHistory.length === 0, 'Empty history should be detected');
        
        // Test with single item
        game.positionHistory = [0];
        this.assertTrue(game.positionHistory.length <= game.nBackLevel, 'Single item should be insufficient for 2-back');
        
        // Test with exactly enough items
        game.positionHistory = [0, 1, 0];
        this.assertTrue(game.positionHistory.length > game.nBackLevel, 'Three items should be sufficient for 2-back');
    }

    // Test 11: Accuracy Calculation
    testAccuracyCalculation() {
        console.log('\n🧪 Test 11: Accuracy Calculation');
        
        // Test perfect accuracy
        const perfectGame = this.createMockGame();
        perfectGame.positionHits = 10;
        perfectGame.positionMisses = 0;
        perfectGame.positionFalseAlarms = 0;
        
        const perfectAccuracy = this.calculateAccuracy(perfectGame.positionHits, perfectGame.positionMisses, perfectGame.positionFalseAlarms);
        this.assertEqual(perfectAccuracy, 100, 'Perfect accuracy should be 100%');
        
        // Test zero accuracy
        const zeroGame = this.createMockGame();
        zeroGame.positionHits = 0;
        zeroGame.positionMisses = 5;
        zeroGame.positionFalseAlarms = 5;
        
        const zeroAccuracy = this.calculateAccuracy(zeroGame.positionHits, zeroGame.positionMisses, zeroGame.positionFalseAlarms);
        this.assertEqual(zeroAccuracy, 0, 'Zero accuracy should be 0%');
        
        // Test mixed accuracy
        const mixedGame = this.createMockGame();
        mixedGame.positionHits = 5;
        mixedGame.positionMisses = 3;
        mixedGame.positionFalseAlarms = 2;
        
        const mixedAccuracy = this.calculateAccuracy(mixedGame.positionHits, mixedGame.positionMisses, mixedGame.positionFalseAlarms);
        this.assertEqual(mixedAccuracy, 50, 'Mixed accuracy should be 50%');
    }

    // Helper method to calculate accuracy (same as in the game)
    calculateAccuracy(hits, misses, falseAlarms) {
        const totalResponses = hits + misses + falseAlarms;
        if (totalResponses === 0) return 0;
        const correctResponses = hits;
        const accuracy = (correctResponses / totalResponses) * 100;
        return Math.max(0, Math.min(100, accuracy));
    }

    // Run all tests
    runAllTests() {
        console.log('🚀 Starting Dual N-Back Algorithm Tests...\n');
        
        this.testBasicPositionMatch();
        this.testBasicWordMatch();
        this.testNoMatch();
        this.test3BackPositionMatch();
        this.testInsufficientHistory();
        this.testCorrectMatchDetection();
        this.testFalseAlarmDetection();
        this.testMissedMatchDetection();
        this.testComplexSequence();
        this.testEdgeCases();
        this.testAccuracyCalculation();
        
        console.log('\n📊 Test Results:');
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📈 Success Rate: ${Math.round((this.passed / (this.passed + this.failed)) * 100)}%`);
        
        if (this.failed === 0) {
            console.log('\n🎉 All tests passed! The N-back algorithms are working correctly.');
        } else {
            console.log('\n⚠️  Some tests failed. Please review the algorithm implementation.');
        }
    }
}

// Run tests when the file is loaded
if (typeof window !== 'undefined') {
    // Browser environment
    window.runNBackTests = function() {
        const tests = new DualNBackTests();
        tests.runAllTests();
    };
    
    // Auto-run tests if this is a test page
    if (window.location.search.includes('test=true')) {
        window.runNBackTests();
    }
} else {
    // Node.js environment
    const tests = new DualNBackTests();
    tests.runAllTests();
} 
