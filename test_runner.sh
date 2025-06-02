#!/bin/bash

echo "🚀 MAEK Protocol - Complete Interface Testing Suite"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test_category() {
    local category_name="$1"
    local test_pattern="$2"
    
    echo -e "${BLUE}📊 Running Test Category: $category_name${NC}"
    echo "----------------------------------------"
    
    cd tests
    
    if cargo test "$test_pattern" -- --nocapture; then
        echo -e "${GREEN}✅ $category_name - PASSED${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ $category_name - FAILED${NC}"
        ((FAILED_TESTS++))
    fi
    
    ((TOTAL_TESTS++))
    cd ..
    echo ""
}

echo -e "${YELLOW}🧪 Phase 1: Unit Tests (Calculation Logic)${NC}"
echo "============================================="

# Test Category 1: Fund Token Calculations
run_test_category "TC-010-013: Deposit Mechanisms" "test_tc_01"

# Test Category 2: NAV Rebase (Profit)
run_test_category "TC-020-022: NAV Rebase Profits" "test_tc_02"

# Test Category 3: NAV Rebase (Loss)
run_test_category "TC-030-033: NAV Rebase Losses" "test_tc_03"

# Test Category 4: Withdrawal Mechanisms
run_test_category "TC-040-042: Withdrawal Mechanisms" "test_tc_04"

# Test Category 5: Integration Flows
run_test_category "TC-070: Complete BUIDL Flow" "test_tc_070"

# Test Category 6: Mathematical Operations
run_test_category "Math Operations: NAV Updates & APY" "test_update_nav\\|test_calculate_apy"

echo -e "${YELLOW}🔥 Phase 2: Full Test Suite${NC}"
echo "============================"

echo "Running ALL unit tests together..."
cd tests
if cargo test unit_tests -- --nocapture; then
    echo -e "${GREEN}✅ All Unit Tests - PASSED${NC}"
    ((PASSED_TESTS++))
else
    echo -e "${RED}❌ All Unit Tests - FAILED${NC}"
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))
cd ..

echo ""
echo -e "${YELLOW}📊 Test Results Summary${NC}"
echo "========================"
echo -e "Total Test Categories: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Your MAEK protocol interfaces are working correctly.${NC}"
    echo ""
    echo -e "${BLUE}📋 Tested Interface Categories:${NC}"
    echo "✅ Fund Initialization & Reset"
    echo "✅ Purchase (Token Creation) - Deposit Mechanisms"  
    echo "✅ Distribution via NAV Rebase (Profit)"
    echo "✅ Rebase Loss Handling"
    echo "✅ Withdrawal (Token Burning)"
    echo "✅ Management Fee Calculations"
    echo "✅ Edge Cases & Error Conditions"
    echo "✅ Integration Test Flows"
    echo ""
    echo -e "${YELLOW}🚀 Ready for blockchain integration testing!${NC}"
else
    echo ""
    echo -e "${RED}⚠️  Some tests failed. Please review the output above.${NC}"
    exit 1
fi 