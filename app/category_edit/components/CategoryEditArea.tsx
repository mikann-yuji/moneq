'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useLocalDB } from '@/localDB/hooks';
import { CollectionNames } from '@/localDB/type';
import { useAuth } from '@/features/auth/hooks';
import { useLocalDBStore } from '@/localDB/store';
import { useRouter } from 'next/navigation';
import { useSortCategory } from '@/hooks/useSortCategory';

type CategoryEditAreaProps<
  K extends CollectionNames.ExpenseCategory
  | CollectionNames.FixedCostCategory 
  | CollectionNames.IncomeCategory
> = {
  collectionName: K;
  title: string;
};

export default function CategoryEditArea<
  K extends CollectionNames.ExpenseCategory
  | CollectionNames.FixedCostCategory
  | CollectionNames.IncomeCategory
>({
  collectionName,
  title,
}: CategoryEditAreaProps<K>) {
  const [tmpCategories, setTmpCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const { putCollection } = useLocalDB();
  const { user, dek } = useAuth();

  const router = useRouter();
  const categoryCollection = useLocalDBStore(state => state.collections[collectionName]);
  const sortedCategories = useSortCategory(collectionName);

  useEffect(() => {
    setTmpCategories(sortedCategories);
  }, [sortedCategories]);

  const updateCategories = (items: string[]) => {
    const updatedCategories = items.map((item, idx) => (
      {
        Category: item,
        OrderNo: idx + 1
      }
    ));
    const updateData = {
      ...categoryCollection[0],
      PlainText: updatedCategories,
      Synced: false,
    }
    if (dek && user) {
      putCollection(collectionName, updateData, dek, user, true);
    } else {
      router.push("/signin");
    }
  }

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(tmpCategories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTmpCategories(items);
    updateCategories(items);
  };

  const handleDelete = (category: string) => {
    const items = tmpCategories.filter(elem => elem !== category);

    setTmpCategories(items);
    updateCategories(items);
  }

  const handleAddCategory = () => {
    const value = newCategory.trim();
    if (!value) return;
    if (tmpCategories.includes(value)) return;
    const items = [...tmpCategories, value];
    
    setTmpCategories(items);
    updateCategories(items);
    setNewCategory('');
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-4 mt-4">{title}</h2>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="expenseCategories">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {tmpCategories.map((category, index) => (
                <Draggable key={category} draggableId={category} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="p-2 mb-2 bg-white rounded shadow cursor-move flex items-center justify-between"
                    >
                      <span>{category}</span>
                      <button
                        type="button"
                        className="ml-2 text-gray-400 hover:text-red-500"
                         onClick={() => handleDelete(category)} // ← 削除処理を追加したい場合
                      >
                        {/* SVGのバツアイコン */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div className="flex mt-4">
        <input
          type="text"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          onBlur={handleAddCategory}
          placeholder="新しいカテゴリーを追加"
          className="flex-1 bg-white rounded shadow px-2 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
    </>
  );
} 