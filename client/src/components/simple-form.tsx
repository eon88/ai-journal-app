export function SimpleForm() {
  return (
    <div style={{ backgroundColor: 'red', padding: '20px', margin: '20px', color: 'white' }}>
      <h1>🚨 NEW FORM TEST 🚨</h1>
      <p>If you can see this red box, then the file changes are working!</p>
      
      <div style={{ backgroundColor: 'white', color: 'black', padding: '15px', margin: '10px 0' }}>
        <label>Mood:</label>
        <select style={{ margin: '0 10px', padding: '5px' }}>
          <option>😊 Happy</option>
          <option>😢 Sad</option>
          <option>😴 Tired</option>
        </select>
      </div>
      
      <div style={{ backgroundColor: 'white', color: 'black', padding: '15px', margin: '10px 0' }}>
        <label>Tags:</label>
        <button style={{ margin: '0 10px', padding: '5px 10px', backgroundColor: 'blue', color: 'white' }}>
          Add Tag
        </button>
      </div>
      
      <textarea 
        placeholder="Write your journal entry here..."
        style={{ width: '100%', height: '100px', padding: '10px', margin: '10px 0' }}
      />
      
      <button style={{ padding: '10px 20px', backgroundColor: 'green', color: 'white', border: 'none' }}>
        Save Entry
      </button>
    </div>
  );
}