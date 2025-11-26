import { describe, it, expect } from "vitest"
import * as Y from "yjs"

describe("Yjs Preview Extraction", () => {
  it("should extract text from a binary Yjs update", () => {
    // 1. Create a Y.Doc and add some content (simulating Tiptap)
    const doc1 = new Y.Doc()
    const fragment = doc1.getXmlFragment("default") // Tiptap uses 'default'

    // Simulate Tiptap structure: <paragraph>Hello World</paragraph>
    const paragraph = new Y.XmlElement("paragraph")
    const text = new Y.XmlText("Hello World")
    paragraph.insert(0, [text])
    fragment.insert(0, [paragraph])

    // 2. Encode state as update (this is what's stored in Firestore)
    const update = Y.encodeStateAsUpdate(doc1)

    // 3. Simulate Server Side: Create new doc and apply update
    const doc2 = new Y.Doc()
    Y.applyUpdate(doc2, update)

    // 4. Extract text
    // Tiptap stores content in 'default' XmlFragment
    const doc2Fragment = doc2.getXmlFragment("default")
    const json = doc2Fragment.toJSON()

    console.log("Extracted JSON:", JSON.stringify(json))

    // A simpler way might be to just use toToString() on the fragment?
    // But that gives XML: <paragraph>Hello World</paragraph>
    const xmlString = doc2Fragment.toString()
    console.log("Extracted XML:", xmlString)

    // We can strip tags from XML string?
    const plainText = xmlString.replace(/<[^>]+>/g, "")
    console.log("Plain Text:", plainText)

    expect(plainText).toBe("Hello World")
  })
})
