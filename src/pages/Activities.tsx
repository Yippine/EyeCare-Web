import { useState } from 'react'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Modal from '../components/common/Modal'
import ProgressRing from '../components/common/ProgressRing'

export default function Activities() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [progress, setProgress] = useState(0)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Activities - Component Test</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Testing UI components library
      </p>

      {/* Button Component Test */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Button Component</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="sm">
            Primary Small
          </Button>
          <Button variant="secondary" size="md">
            Secondary Medium
          </Button>
          <Button variant="outline" size="lg">
            Outline Large
          </Button>
        </div>
      </Card>

      {/* Card Component Test */}
      <Card hover>
        <h2 className="text-xl font-semibold mb-2">Card Component</h2>
        <p className="text-gray-600 dark:text-gray-300">
          This is a card with hover effect. Hover over it to see the animation!
        </p>
      </Card>

      {/* Modal Component Test */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Modal Component</h2>
        <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Test Modal"
        >
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This is a modal with animations. Click outside or press ESC to
            close.
          </p>
          <Button onClick={() => setIsModalOpen(false)}>Close</Button>
        </Modal>
      </Card>

      {/* ProgressRing Component Test */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">ProgressRing Component</h2>
        <div className="flex items-center gap-8 mb-4">
          <ProgressRing progress={progress} />
          <ProgressRing
            progress={75}
            size={80}
            strokeWidth={6}
            color="#FFE66D"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setProgress(Math.min(100, progress + 10))}>
            Increase
          </Button>
          <Button
            variant="secondary"
            onClick={() => setProgress(Math.max(0, progress - 10))}
          >
            Decrease
          </Button>
          <Button variant="outline" onClick={() => setProgress(0)}>
            Reset
          </Button>
        </div>
      </Card>
    </div>
  )
}
