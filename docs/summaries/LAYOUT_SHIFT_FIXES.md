# Layout Shift Prevention Guide
## Fixing Layout Shifts in SmartLab LIMS

### Overview
Layout shifts occur when elements on a page change size or position after the initial render, causing a poor user experience. This guide provides solutions for common layout shift issues in the LIMS application.

---

## 🚨 Common Layout Shift Sources

### 1. **Images Without Dimensions**
**Problem**: Images load after the page renders, causing layout shifts.

**Solution**: Always specify width and height attributes or use CSS aspect-ratio.

```jsx
// ❌ Bad - causes layout shift
<img src="/logo.png" alt="Logo" />

// ✅ Good - prevents layout shift
<img 
  src="/logo.png" 
  alt="Logo" 
  width="200" 
  height="100"
  style={{ aspectRatio: '2/1' }}
/>
```

### 2. **Dynamic Content Loading**
**Problem**: Content loads asynchronously, changing container heights.

**Solution**: Use skeleton loaders and fixed minimum heights.

```jsx
// ❌ Bad - causes layout shift
const [data, setData] = useState(null);
return <div>{data ? <DataComponent data={data} /> : null}</div>;

// ✅ Good - prevents layout shift
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

return (
  <div style={{ minHeight: '400px', contain: 'layout style paint' }}>
    {loading ? <SkeletonLoader height="400px" /> : <DataComponent data={data} />}
  </div>
);
```

### 3. **Font Loading**
**Problem**: Custom fonts load after page render, changing text dimensions.

**Solution**: Use font-display: swap and preload critical fonts.

```css
/* Add to your CSS */
@font-face {
  font-family: 'Inter';
  font-display: swap;
  src: url('/fonts/Inter-Regular.woff2') format('woff2');
}

/* Preload critical fonts */
<link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin>
```

### 4. **Dynamic Text Content**
**Problem**: Text content changes length, affecting layout.

**Solution**: Use fixed widths or minimum heights for text containers.

```jsx
// ❌ Bad - causes layout shift
<div>{dynamicText}</div>

// ✅ Good - prevents layout shift
<div style={{ minHeight: '1.2em', contain: 'layout style paint' }}>
  {dynamicText}
</div>
```

---

## 🛠️ Implementation Solutions

### 1. **Use Layout Shift Prevention Components**

```jsx
import { 
  LayoutShiftPreventionWrapper, 
  SkeletonLoader,
  useLayoutShiftPrevention 
} from '../utils/layoutShiftPrevention';

// For containers
<LayoutShiftPreventionWrapper 
  styleType="card" 
  minHeight="300px"
>
  <YourComponent />
</LayoutShiftPreventionWrapper>

// For loading states
const containerRef = useLayoutShiftPrevention(isLoading, '400px');

return (
  <div ref={containerRef}>
    {isLoading ? <SkeletonLoader /> : <Content />}
  </div>
);
```

### 2. **Apply CSS Containment**

```css
/* Prevent layout shifts for specific elements */
.layout-stable {
  contain: layout style paint;
  min-height: 0;
  min-width: 0;
}

/* For images */
img {
  max-width: 100%;
  height: auto;
  aspect-ratio: attr(width) / attr(height);
  contain: layout style paint;
}

/* For buttons */
button {
  min-width: 80px;
  min-height: 36px;
  contain: layout style paint;
}
```

### 3. **Use Fixed Aspect Ratios**

```jsx
// For responsive containers
<div style={{ 
  aspectRatio: '16/9',
  contain: 'layout style paint'
}}>
  <Content />
</div>

// For cards
<div style={{ 
  aspectRatio: '4/3',
  contain: 'layout style paint'
}}>
  <CardContent />
</div>
```

---

## 📊 Monitoring and Debugging

### 1. **Enable Layout Shift Monitoring**

```jsx
import { debugLayoutShifts } from '../utils/layoutShiftPrevention';

// In your main App component
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    debugLayoutShifts();
  }
}, []);
```

### 2. **Check Browser DevTools**

1. Open Chrome DevTools
2. Go to Performance tab
3. Record page load
4. Look for "Layout Shift" entries
5. Identify problematic elements

### 3. **Use Lighthouse Audits**

1. Run Lighthouse audit
2. Check "Cumulative Layout Shift" score
3. Review specific elements causing shifts
4. Implement fixes based on recommendations

---

## 🎯 Specific Fixes for LIMS Components

### 1. **Dashboard Cards**

```jsx
// Before - causes layout shifts
const StatCard = ({ title, value, change }) => (
  <div className="stat-card">
    <h3>{title}</h3>
    <div className="value">{value}</div>
    <div className="change">{change}</div>
  </div>
);

// After - prevents layout shifts
const StatCard = ({ title, value, change }) => (
  <LayoutShiftPreventionWrapper 
    styleType="card" 
    minHeight="120px"
  >
    <div className="stat-card">
      <h3 style={{ minHeight: '1.2em' }}>{title}</h3>
      <div className="value" style={{ minHeight: '2em' }}>{value}</div>
      <div className="change" style={{ minHeight: '1.2em' }}>{change}</div>
    </div>
  </LayoutShiftPreventionWrapper>
);
```

### 2. **Data Tables**

```jsx
// Before - causes layout shifts
const DataTable = ({ data, loading }) => (
  <table>
    {loading ? null : data.map(row => <TableRow key={row.id} data={row} />)}
  </table>
);

// After - prevents layout shifts
const DataTable = ({ data, loading }) => {
  const tableRef = useLayoutShiftPrevention(loading, '400px');
  
  return (
    <div ref={tableRef}>
      {loading ? (
        <SkeletonList items={10} height="50px" />
      ) : (
        <table>
          {data.map(row => <TableRow key={row.id} data={row} />)}
        </table>
      )}
    </div>
  );
};
```

### 3. **Modal Dialogs**

```jsx
// Before - causes layout shifts
const Modal = ({ isOpen, children }) => (
  isOpen && (
    <div className="modal">
      <div className="modal-content">{children}</div>
    </div>
  )
);

// After - prevents layout shifts
const Modal = ({ isOpen, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        className="modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ contain: 'layout style paint' }}
      >
        <motion.div 
          className="modal-content"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          style={{ minHeight: '200px', contain: 'layout style paint' }}
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
```

---

## 🔧 Performance Optimization

### 1. **Use CSS Containment**

```css
/* Apply to stable containers */
.stable-container {
  contain: layout style paint;
}

/* Apply to dynamic content areas */
.dynamic-content {
  contain: layout style paint;
  min-height: 200px;
}
```

### 2. **Optimize Images**

```jsx
// Use next/image or similar for automatic optimization
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 3. **Preload Critical Resources**

```html
<!-- Add to your HTML head -->
<link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/logo.png" as="image">
```

---

## 📈 Success Metrics

### Target Performance Scores
- **Cumulative Layout Shift**: < 0.1
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **First Input Delay**: < 100ms

### Monitoring Tools
1. **Lighthouse**: Regular performance audits
2. **Web Vitals**: Real user monitoring
3. **Chrome DevTools**: Development debugging
4. **Custom Monitoring**: Layout shift detection

---

## 🚀 Quick Wins

### 1. **Immediate Fixes**
- Add `contain: layout style paint` to all containers
- Set minimum heights for dynamic content
- Use skeleton loaders for loading states
- Specify image dimensions

### 2. **Medium-term Improvements**
- Implement proper font loading strategy
- Optimize image delivery
- Use CSS Grid/Flexbox with fixed dimensions
- Add aspect-ratio CSS property

### 3. **Long-term Optimization**
- Implement virtual scrolling for large lists
- Use intersection observer for lazy loading
- Optimize bundle size and code splitting
- Implement proper caching strategies

---

## 📚 Additional Resources

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Layout Shift Prevention Guide](https://web.dev/cls/)
- [CSS Containment Specification](https://developer.mozilla.org/en-US/docs/Web/CSS/contain)
- [Performance Monitoring Best Practices](https://web.dev/performance-monitoring/)

---

## 🎯 Next Steps

1. **Audit Current Layout Shifts**: Use the monitoring tools to identify specific issues
2. **Implement Fixes**: Apply the solutions outlined in this guide
3. **Test Performance**: Measure improvements using Lighthouse and Web Vitals
4. **Monitor Continuously**: Set up ongoing monitoring to prevent regressions
5. **Document Patterns**: Create reusable components and patterns for future development

By following this guide, you can significantly reduce layout shifts in the LIMS application and provide a better user experience. 