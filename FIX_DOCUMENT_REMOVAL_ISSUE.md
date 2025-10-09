# Fix: Documents Getting Removed After IDP Response

## 🐛 Issue Description

After uploading a document and receiving the IDP extraction response, the uploaded document images were being removed from the UI, leaving only the extracted details.

## 🔍 Root Cause

The problem was caused by **stale closure** in the asynchronous success callback:

```typescript
// BEFORE (Problematic Code)
const docs = useSelector((state: any) => state.customer.personalDocuments);

documentUploadManager.queueUpload(
  document,
  applicationId,
  index,
  screenId,
  deviceId,
  progressCallback,
  (response, taskId) => {
    // ❌ This 'docs' variable is STALE!
    // It references the state from when the upload started,
    // not the current Redux state
    const currentDocs = [...docs];

    // Processing with stale data...
    // This could be missing the uploaded document!
  },
);
```

### Why This Happened:

1. **User uploads Document 1** → Component renders with `docs = [doc1]`
2. **Upload starts** → Callback captures `docs = [doc1]` in closure
3. **User immediately uploads Document 2** → Redux updates to `docs = [doc1, doc2]`
4. **Component re-renders** with new `docs = [doc1, doc2]`
5. **IDP response arrives for Document 1** → Callback runs with old `docs = [doc1]` ❌
6. **Document 1 details updated** but Document 2 is lost because callback had stale data

## ✅ Solution

Access the Redux store **directly** in the callback to get the latest state:

```typescript
// AFTER (Fixed Code)
import store from '@src/store';

const docs = useSelector((state: any) => state.customer.personalDocuments);

documentUploadManager.queueUpload(
  document,
  applicationId,
  index,
  screenId,
  deviceId,
  progressCallback,
  (response, taskId) => {
    // ✅ Get FRESH state directly from Redux store
    const latestState = store.getState().customer;
    const currentDocs =
      latestState.personalDocuments?.length > 0
        ? [...latestState.personalDocuments]
        : [{ id: 1, name: '', doc: [], details: {} }];

    // Now we have the latest documents including all uploads!
    // Safe to update without losing data
  },
);
```

## 📝 Changes Made

### Files Modified:

1. **src/screens/Customer/PersonalDoc.tsx**

   - Added `import store from '@src/store';`
   - Updated success callback to use `store.getState().customer.personalDocuments`
   - Added null check to ensure document exists before updating

2. **src/screens/Customer/LoanDoc.tsx**

   - Added `import store from '@src/store';`
   - Updated success callback to use `store.getState().customer.loanDocuments`

3. **src/screens/Customer/LinkedEntities.tsx**
   - Added `import store from '@src/store';`
   - Updated success callback to use `store.getState().customer.linkedEntitiesDocuments`

## 🎯 Key Points

### Why Direct Store Access?

Using `store.getState()` in the callback ensures we always get the **current** state, not the state from when the component last rendered.

```typescript
// Component closure (stale)
const docs = useSelector(...); // Captured at render time
setTimeout(() => {
  console.log(docs); // ❌ Old state
}, 1000);

// Direct store access (always fresh)
setTimeout(() => {
  const freshDocs = store.getState().customer.personalDocuments;
  console.log(freshDocs); // ✅ Current state
}, 1000);
```

### When Does This Matter?

This issue occurs when:

- ✅ Multiple documents uploaded quickly (parallel uploads)
- ✅ User adds more documents before previous upload completes
- ✅ Any async operation that updates state after delay
- ✅ Callbacks that execute after state has changed

### Alternative Solutions (Not Used)

We considered but didn't use these approaches:

1. **useRef to track state** - More complex, harder to maintain
2. **Redux middleware** - Overkill for this use case
3. **Passing state through callback chain** - Would require changing upload manager API
4. **useEffect to sync state** - Would cause unnecessary re-renders

## 🧪 Testing

To verify the fix works:

1. **Quick Upload Test:**

   ```
   Upload Document 1 → Immediately upload Document 2 → Wait for responses

   Expected: Both documents visible with their extracted data ✅
   Before Fix: Document 2 might disappear ❌
   ```

2. **Parallel Upload Test:**

   ```
   Upload 3 documents within 1 second

   Expected: All 3 documents remain with extracted data ✅
   Before Fix: Some documents disappear ❌
   ```

3. **Console Check:**

   ```javascript
   // Should NOT see this warning:
   'Document at index X not found, skipping update';

   // Should see successful updates:
   '[IDP] Extracted data: {...}';
   'Updated document names to: AadhaarCard';
   ```

## 💡 Best Practices Learned

### ✅ DO:

- Access Redux store directly in async callbacks
- Get fresh state when processing delayed responses
- Add null checks before array access
- Test with rapid sequential actions

### ❌ DON'T:

- Rely on component closure for async operations
- Assume state is unchanged in callbacks
- Skip validation when accessing array indices
- Only test with slow, sequential actions

## 📊 Impact

### Before Fix:

- ❌ Documents disappeared after IDP response
- ❌ User had to re-upload documents
- ❌ Poor user experience
- ❌ Data loss risk

### After Fix:

- ✅ All documents preserved after IDP response
- ✅ Smooth parallel uploads
- ✅ Excellent user experience
- ✅ No data loss

## 🚀 Additional Improvements

Added safety features:

```typescript
// Null check to prevent errors
if (!updatedDocumentsWithNames[index]) {
  console.warn(`Document at index ${index} not found, skipping update`);
  return;
}

// Safe array access with fallback
const updatedDocs = (currentDoc.doc || []).map(...);
```

## 📖 References

- **JavaScript Closures**: Why variables get captured at definition time
- **Redux Best Practices**: When to use `store.getState()` vs `useSelector`
- **React Hooks**: Understanding stale closures in async callbacks

## ✅ Status

**FIXED** - All tests passing, no linter errors, documents no longer disappear after IDP response.

---

**Date Fixed:** October 9, 2025  
**Issue Type:** Stale Closure / State Management  
**Severity:** High (Data Loss)  
**Resolution Time:** Immediate
