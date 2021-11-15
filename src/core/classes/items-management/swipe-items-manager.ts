// (C) Copyright 2015 Moodle Pty Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ActivatedRoute } from '@angular/router';

import { CoreNavigator } from '@services/navigator';

import { CoreItemsManager } from './items-manager';

/**
 * Helper class to manage the state and routing of a swipeable page.
 */
export abstract class CoreSwipeItemsManager<Item = unknown> extends CoreItemsManager<Item> {

    /**
     * Process page started operations.
     */
    async start(): Promise<void> {
        this.updateSelectedItem();
    }

    /**
     * Navigate to the next item.
     */
    async navigateToNextItem(): Promise<void> {
        await this.navigateToItemBy(-1, 'back');
    }

    /**
     * Navigate to the previous item.
     */
    async navigateToPreviousItem(): Promise<void> {
        await this.navigateToItemBy(1, 'forward');
    }

    /**
     * @inheritdoc
     */
    protected getCurrentPageRoute(): ActivatedRoute | null {
        return CoreNavigator.getCurrentRoute();
    }

    /**
     * Navigate to an item by an offset.
     *
     * @param delta Index offset.
     * @param animationDirection Animation direction.
     */
    protected async navigateToItemBy(delta: number, animationDirection: 'forward' | 'back'): Promise<void> {
        const item = await this.getItemBy(delta);

        if (!item) {
            return;
        }

        await this.navigateToItem(item, { animationDirection, replace: true });
    }

    /**
     * Get item by an offset.
     *
     * @param delta Index offset.
     */
    protected async getItemBy(delta: number): Promise<Item | null> {
        const items = this.getSource().getItems();

        // Get current item.
        const index = (this.selectedItem && items?.indexOf(this.selectedItem)) ?? -1;

        if (index === -1) {
            return null;
        }

        // Get item by delta.
        const item = items?.[index + delta] ?? null;

        if (!item && !this.getSource().isCompleted()) {
            await this.getSource().loadNextPage();

            return this.getItemBy(delta);
        }

        return item;
    }

}