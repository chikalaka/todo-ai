"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit2, Trash2, Tag as TagIcon } from "lucide-react"
import { useTags } from "@/lib/hooks/useTags"
import { useTodos } from "@/lib/hooks/useTodos"
import { Tag } from "@/lib/types/database.types"
import { CreateTagDialog } from "./CreateTagDialog"
import { EditTagDialog } from "./EditTagDialog"
import { DeleteTagConfirmDialog } from "./DeleteTagConfirmDialog"

export function TagManagement() {
  const { tags, isLoading, error } = useTags()
  const { todos } = useTodos() // Get all todos to count usage
  const [searchTerm, setSearchTerm] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)

  // Filter tags based on search term
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Function to count how many todos use a specific tag
  const getTagUsageCount = (tagId: string) => {
    return todos.filter((todo) => todo.tags?.some((tag) => tag.id === tagId))
      .length
  }

  const handleEditTag = (tag: Tag) => {
    setSelectedTag(tag)
    setEditDialogOpen(true)
  }

  const handleDeleteTag = (tag: Tag) => {
    setSelectedTag(tag)
    setDeleteDialogOpen(true)
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading tags...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading tags: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/70 border-gray-200 focus:bg-white transition-colors"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              ×
            </Button>
          )}
        </div>

        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Tag
        </Button>
      </div>

      {/* Tags Grid */}
      {filteredTags.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <TagIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500">
              {searchTerm ? (
                <div>
                  <div className="text-sm">No tags match your search</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="mt-2 text-xs"
                  >
                    Clear search to see all tags
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="text-sm mb-2">No tags found</div>
                  <Button
                    onClick={() => setCreateDialogOpen(true)}
                    size="sm"
                    className="text-xs"
                  >
                    Create your first tag
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTags.map((tag) => {
            const usageCount = getTagUsageCount(tag.id)
            return (
              <Card key={tag.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TagIcon className="h-4 w-4 text-blue-500" />
                      <span className="truncate">{tag.name}</span>
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTag(tag)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTag(tag)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Used in {usageCount} todo{usageCount !== 1 ? "s" : ""}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {new Date(tag.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Results Summary */}
      {searchTerm && filteredTags.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500 py-2 border-t border-gray-100">
          <div className="h-1 w-1 bg-blue-400 rounded-full"></div>
          <span>
            {filteredTags.length} of {tags.length} tags
          </span>
        </div>
      )}

      {/* Dialogs */}
      <CreateTagDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedTag && (
        <>
          <EditTagDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            tag={selectedTag}
            onClose={() => setSelectedTag(null)}
          />
          <DeleteTagConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            tag={selectedTag}
            usageCount={getTagUsageCount(selectedTag.id)}
            onClose={() => setSelectedTag(null)}
          />
        </>
      )}
    </div>
  )
}
